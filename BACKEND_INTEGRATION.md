# Backend Integration Guide: Wiring Real UCP & Google Cloud Services

This document provides complete instructions for backend engineers connecting **Cymbal Auto** to production or staging services, including the **Universal Commerce Protocol (UCP)**, **Google Cloud Pub/Sub**, **AP2 Pre-Authorization Gateways**, and **Google ADK / Long Horizon Agents**.

---

## 📋 Table of Contents
1. [Service Architecture & Abstraction Layer](#1-service-architecture--abstraction-layer)
2. [Swapping Mock with UcpCommerceProvider](#2-swapping-mock-with-ucpcommerceprovider)
3. [Universal Commerce Protocol (UCP) API Specifications](#3-universal-commerce-protocol-ucp-api-specifications)
4. [Autonomous Purchasing (AP2) Protocol Implementation](#4-autonomous-purchasing-ap2-protocol-implementation)
5. [Google Cloud Pub/Sub Domain Event Bus](#5-google-cloud-pubsub-domain-event-bus)
6. [Database Schema Recommendations](#6-database-schema-recommendations)
7. [Inbound Webhooks & Server-Side API Proxy](#7-inbound-webhooks--server-side-api-proxy)
8. [Environment Variables Reference](#8-environment-variables-reference)

---

## 1. Service Architecture & Abstraction Layer

The frontend components never call concrete mock methods directly. All interactions flow through the contracts defined in `/lib/services/interfaces.ts`:

- `ICommerceProvider`: Cart, products, stores, checkout sessions, orders.
- `IInventoryProvider`: Stock lookups, multi-store levels, replenishment.
- `IPurchaseIntentRepository`: Conditional back-in-stock intent storage and fulfillment.
- `ISurveyRepository`: Customer feedback and NPS response persistence.
- `IEventPublisher`: Domain event dispatching.

```
┌────────────────────────────────────────────────────────┐
│               Frontend (CommerceContext)               │
└───────────────────────────┬────────────────────────────┘
                            │ Calls Interfaces
                            ▼
┌────────────────────────────────────────────────────────┐
│                ICommerceProvider Interface              │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
  ┌─────────────────────────┐  ┌────────────────────────┐
  │   MockCommerceService   │  │  UcpCommerceProvider   │
  │   (Local Sandbox Demo)  │  │  (Real Production UCP) │
  └─────────────────────────┘  └────────────────────────┘
```

---

## 2. Swapping Mock with UcpCommerceProvider

To switch the entire application from the mock layer to your real backend, update `/components/CommerceContext.tsx` or configure a factory provider:

### Step 1: Create your `UcpCommerceProvider`
Copy the starter template from `/lib/services/ucpCommerceProvider.template.ts` into `/lib/services/ucpCommerceProvider.ts` and populate your API endpoints.

```typescript
// /lib/services/ucpCommerceProvider.ts
import { ICommerceProvider, IInventoryProvider, IPurchaseIntentRepository, ISurveyRepository } from './interfaces';

export class UcpCommerceProvider implements ICommerceProvider, IInventoryProvider, IPurchaseIntentRepository, ISurveyRepository {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_UCP_API_URL || 'https://api.ucp.cymbalauto.co.uk/v1';
    this.apiKey = process.env.UCP_API_KEY || '';
  }

  // Implement all interface methods against your HTTP/gRPC endpoints...
}
```

### Step 2: Inject in `CommerceContext.tsx`
Replace the import in `/components/CommerceContext.tsx`:

```diff
- import { mockCommerceService, eventPublisher } from '@/lib/services/mockCommerceService';
+ import { ucpCommerceService } from '@/lib/services/ucpCommerceProvider';
+ import { cloudPubSubPublisher } from '@/lib/services/cloudPubSubPublisher';

- const commerceService = mockCommerceService;
- const activePublisher = eventPublisher;
+ const commerceService = ucpCommerceService;
+ const activePublisher = cloudPubSubPublisher;
```

---

## 3. Universal Commerce Protocol (UCP) API Specifications

The UCP standard structures the checkout lifecycle into 4 distinct deterministic states:

```
    ┌──────────┐      Stall Event      ┌──────────┐
    │  ACTIVE  ├──────────────────────►│ STALLED  │
    └────┬─────┘                       └────┬─────┘
         │                                  │
         │ Payment Complete                 │ Agent Recovery Offer Applied
         ▼                                  ▼
   ┌───────────┐                     ┌────────────────────┐
   │ COMPLETED │                     │ RECOVERY_OFFERED   │
   └───────────┘                     └──────────┬─────────┘
                                                │
                                                │ Checkout Resumed
                                                ▼
                                          ┌───────────┐
                                          │ COMPLETED │
                                          └───────────┘
```

### Key Endpoints to Expose:

#### A. Checkout Sessions (`POST /v1/checkout/sessions`)
**Request Body:**
```json
{
  "cartId": "cart_uk_8921",
  "storeId": "store_birmingham_01",
  "customer": {
    "fullName": "James Walker",
    "email": "j.walker@example.co.uk",
    "phone": "+44 7700 900123"
  },
  "vehicle": {
    "registration": "BK72 XDA",
    "make": "BMW",
    "model": "3 Series 320i",
    "year": 2022
  },
  "fittingPreference": "in_store",
  "selectedTimeSlot": {
    "id": "slot_10am",
    "date": "2026-08-25",
    "time": "10:00 - 11:00",
    "bayNumber": 2
  }
}
```

**Response:**
```json
{
  "checkoutId": "chk_89327491",
  "status": "ACTIVE",
  "subtotal": 249.98,
  "fittingFee": 0.00,
  "vatAmount": 49.99,
  "discountAmount": 0.00,
  "total": 249.98,
  "expiresAt": "2026-08-21T14:30:00Z"
}
```

#### B. Checkout Stall Hook (`POST /v1/checkout/sessions/{checkoutId}/stall`)
Emits `commerce.checkout.stalled` to the event stream, allowing Long Horizon Agents to assess friction and calculate recovery incentives.

#### C. Recovery Offer (`POST /v1/checkout/sessions/{checkoutId}/recovery`)
**Request Body:**
```json
{
  "discountPercent": 10,
  "reason": "Agent assisted recovery - bay fitting guarantee",
  "agentId": "agent_checkout_optimizer_01"
}
```

---

## 4. Autonomous Purchasing (AP2) Protocol Implementation

AP2 enables consumers to grant conditional pre-authorization for out-of-stock items.

### Pre-Authorization Record Structure
```json
{
  "intentId": "intent_78912",
  "userId": "user_456",
  "productId": "michelin-ps5-225-45r17",
  "storeId": "store_birmingham_01",
  "targetQuantity": 2,
  "maxPriceCap": 270.00,
  "status": "PENDING_STOCK",
  "expiryDate": "2026-09-21T00:00:00Z",
  "preAuthPaymentToken": "tok_visa_preauth_9812",
  "allowSubstitutes": false,
  "autoExecuteAp2": true,
  "createdAt": "2026-08-21T08:00:00Z"
}
```

### Auto-Fulfillment Logic (Triggered on `inventory.replenished`)
When an inventory replenishment event occurs:
1. Query `purchase_intents` WHERE `productId = :id` AND `storeId = :storeId` AND `status = 'PENDING_STOCK'`.
2. Check if `product.price * targetQuantity <= maxPriceCap`.
3. If valid and `autoExecuteAp2 = true`:
   - Charge payment token via payment gateway (`POST /v1/payments/capture-preauth`).
   - Create Order record with `paymentStatus = 'PAID'` and note `AP2 Autonomous Execution`.
   - Decrement reserved inventory.
   - Mark intent `status = 'FULFILLED'` with `orderId`.
   - Dispatch domain event `commerce.purchase_intent.fulfilled`.
   - Send confirmation SMS/Email with workshop fitting booking link.

---

## 5. Google Cloud Pub/Sub Domain Event Bus

All domain activities emit typed events matching CloudEvents 1.0 specifications.

### Topic: `projects/{PROJECT_ID}/topics/cymbal-commerce-events`

### Published Event Types:
| Event Type | Producer | Description | Payload Key Fields |
|---|---|---|---|
| `inventory.replenished` | Inventory / WMS | Stock arrived at depot | `productId`, `storeId`, `addedQuantity`, `newQuantity` |
| `commerce.checkout.stalled` | Storefront | Cart abandoned or hesitated | `checkoutId`, `items`, `stalledAt`, `lastStep` |
| `commerce.checkout.recovered` | ADK Agent | Agent offered discount | `checkoutId`, `discountPercent`, `totalAfterDiscount` |
| `commerce.purchase_intent.created` | Consumer | AP2 intent placed | `intentId`, `productId`, `maxPriceCap`, `quantity` |
| `commerce.purchase_intent.fulfilled` | AP2 Agent | Auto-order created | `intentId`, `orderId`, `totalPaid`, `timestamp` |
| `customer.survey.submitted` | Consumer | NPS & feedback submitted | `orderId`, `rating`, `sentiment`, `feedback` |

---

## 6. Database Schema Recommendations

### PostgreSQL / Cloud SQL DDL Sample:

```sql
-- Store Locations
CREATE TABLE stores (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    postcode VARCHAR(20) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE
);

-- Products Catalog
CREATE TABLE products (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    tyre_size VARCHAR(50) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    fuel_efficiency VARCHAR(2),
    wet_grip VARCHAR(2),
    noise_level_db INT,
    season VARCHAR(50),
    vehicle_type VARCHAR(50),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Depot Inventory
CREATE TABLE store_inventory (
    product_id VARCHAR(64) REFERENCES products(id),
    store_id VARCHAR(64) REFERENCES stores(id),
    quantity INT NOT NULL DEFAULT 0,
    state VARCHAR(50) NOT NULL DEFAULT 'In Stock',
    PRIMARY KEY (product_id, store_id)
);

-- Purchase Intents (AP2 Pre-authorizations)
CREATE TABLE purchase_intents (
    id VARCHAR(64) PRIMARY KEY,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255),
    product_id VARCHAR(64) REFERENCES products(id),
    store_id VARCHAR(64) REFERENCES stores(id),
    target_quantity INT NOT NULL,
    max_price_cap NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_STOCK',
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    allow_substitutes BOOLEAN DEFAULT FALSE,
    auto_execute_ap2 BOOLEAN DEFAULT TRUE,
    pre_auth_payment_ref VARCHAR(255),
    fulfillment_order_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
    id VARCHAR(64) PRIMARY KEY,
    checkout_id VARCHAR(64),
    store_id VARCHAR(64) REFERENCES stores(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    vehicle_registration VARCHAR(20),
    total NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
    fitting_date VARCHAR(50),
    fitting_time VARCHAR(50),
    bay_number INT,
    fitting_pin VARCHAR(10),
    survey_token VARCHAR(64) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 7. Inbound Webhooks & Server-Side API Proxy

The application includes Next.js server route handlers in `/app/api/`:

- `POST /api/ucp/webhook`: Accepts inbound signals from supplier WMS, ERPs, or Agent systems.
- `GET /api/events`: Server-Sent Events (SSE) or REST endpoint for frontend event consumption.

---

## 8. Environment Variables Reference

Create a `.env.local` file based on `.env.example`:

```env
# UCP Configuration
UCP_API_URL=https://api.ucp.cymbalauto.co.uk/v1
UCP_API_KEY=your_ucp_service_account_key

# Google Cloud & Pub/Sub
GCP_PROJECT_ID=cymbal-auto-retail-prod
GCP_PUBSUB_TOPIC=cymbal-commerce-events
GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa-key.json

# Payment & AP2 Gateway
AP2_GATEWAY_URL=https://gateway.ap2.example.com
AP2_MERCHANT_ID=cymbal_uk_merch_01

# Next.js Server Secrets
GEMINI_API_KEY=your_gemini_api_key_here
```
