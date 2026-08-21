# Cymbal Auto UK — Universal Commerce Protocol (UCP) & Agent Demo Platform

[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind_css)](https://tailwindcss.com/)
[![Universal Commerce Protocol](https://img.shields.io/badge/UCP-Compliant-blue?style=flat)](https://github.com/)
[![AP2 Autonomous Purchasing](https://img.shields.io/badge/AP2-Autonomous_Intent-amber?style=flat)](https://github.com/)
[![Google ADK Ready](https://img.shields.io/badge/Google_ADK-Long_Horizon_Agent_Ready-4285F4?style=flat&logo=google)](https://cloud.google.com/)

---

## 📌 Executive Summary

**Cymbal Auto** is a state-of-the-art multi-depot automotive tyre and autocentre retail platform designed to demonstrate and test next-generation **Universal Commerce Protocol (UCP)** integrations and **Google Agent Development Kit (ADK) / Long Horizon Agents**.

The application delivers:
1. **Full-Featured Consumer Storefront**: Multi-depot inventory lookup (Birmingham, Bristol, Croydon), tyre sizing/registration DVLA matchers, workshop bay scheduling, mobile van fitting, responsive basket & checkout, and post-purchase customer satisfaction loops.
2. **Autonomous Intent Purchasing (AP2)**: Pre-authorized "Buy when back in stock" workflows that autonomously trigger and fulfill orders when inventory is replenished.
3. **Checkout Stall & Recovery Agent Harness**: Lifecycle management of cart sessions with agent recovery triggers and discount adjustments.
4. **Live Event Stream & Domain Telemetry**: Cloud Pub/Sub ready event bus capturing `inventory.replenished`, `commerce.checkout.stalled`, `commerce.checkout.recovered`, `commerce.purchase_intent.fulfilled`, and `customer.survey.submitted`.
5. **Operator Demo Control Center (`/demo-controls`)**: An interactive dashboard to manipulate inventory, trigger checkout states, inspect JSON payloads, and test end-to-end agent workflows.

---

## 🏛 System Architecture

```
                                  ┌──────────────────────────────────────────────┐
                                  │           Google ADK / Vertex AI             │
                                  │            Long Horizon Agents               │
                                  └──────┬────────────────┬──────────────┬───────┘
                                         │                │              │
                               Tool Calls│                │Webhooks      │Pub/Sub Events
                                         ▼                ▼              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 Cymbal Auto Next.js Application                        │
│                                                                                        │
│  ┌─────────────────────────────────┐           ┌────────────────────────────────────┐  │
│  │       Customer Storefront       │           │       Operator Demo Center         │  │
│  │   /  /shop  /cart  /checkout    │           │          /demo-controls            │  │
│  └────────────────┬────────────────┘           └─────────────────┬──────────────────┘  │
│                   │                                              │                     │
│                   ▼                                              ▼                     │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                          Commerce Context (React State)                          │  │
│  └────────────────────────────────────────┬─────────────────────────────────────────┘  │
│                                           │                                            │
│                                           ▼                                            │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                        Service Abstraction Layer (Interfaces)                    │  │
│  │     ICommerceProvider  •  IInventoryProvider  •  IPurchaseIntentRepository       │  │
│  │            IEventPublisher  •  ISurveyRepository                                 │  │
│  └───────────────────┬──────────────────────────────────────────┬───────────────────┘  │
│                      │                                          │                      │
│                      ▼                                          ▼                      │
│     ┌─────────────────────────────────┐        ┌──────────────────────────────────┐    │
│     │  MockCommerceService (Active)   │        │   UcpCommerceProvider (Ready)    │    │
│     │  In-memory + reactive listeners │        │   Real UCP REST / gRPC Backend   │    │
│     └─────────────────────────────────┘        └──────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Demonstration Scenarios

### Scenario 1: Autonomous Back-in-Stock Purchase Intent (AP2)
1. Navigate to **Tyre Catalog (`/shop`)** or the **Birmingham** store.
2. Select **Michelin Pilot Sport 5** (which is seeded as *Out of Stock* at Birmingham Central).
3. Click **"Buy when back in stock"**.
4. The **Purchase Intent Modal** opens:
   - Configure **Quantity** (e.g. 2 tyres)
   - Set **Max Total Price Cap** (e.g. £270.00)
   - Select **Pre-authorized Payment Method** (Visa ending 4242)
   - Enable **AP2 Autonomous Execution**
   - Click **Authorize Purchase Intent**.
5. Open **Operator Demo Controls (`/demo-controls`)** &rarr; **Inventory Tab**.
6. Find *Michelin Pilot Sport 5* at Birmingham and click **"Replenish Stock (+4)"**.
7. **Observer Outcome**:
   - The event `inventory.replenished` fires.
   - The intent repository detects the stock arrival within the price cap.
   - It autonomously creates Order `ORD-AUTO-...`, updates the intent status to `FULFILLED`, and publishes `commerce.purchase_intent.fulfilled`.
   - View the new order immediately under the **Orders Tab**!

### Scenario 2: Checkout Stall & Agent Recovery Loop
1. Add any tyre to your basket and proceed to **Checkout (`/checkout`)**.
2. Advance through Step 1 (Vehicle details) and Step 2 (Customer details).
3. In the right panel, click **"Simulate Stall (Agent Trigger)"**.
4. The session transitions to `STALLED`, emitting `commerce.checkout.stalled`.
5. Next, click **"Simulate Agent Recovery Offer"** (or use the Demo Controls Checkout tab).
6. A **10% Recovery Discount** is applied to the active checkout with a personalized agent banner, emitting `commerce.checkout.recovered`.
7. Complete checkout with 1-click test payment.

### Scenario 3: Closed-Loop Post-Purchase Feedback (NPS)
1. Upon completing an order, navigate to the Order Confirmation page (`/order/[id]/complete`).
2. Click **"Take 30-Second Survey"** or launch `/survey/[token]`.
3. Submit a 0–10 Net Promoter Score (NPS) and qualitative review.
4. Inspect the resulting `customer.survey.submitted` event with parsed sentiment in the **Live Event Bus**.

---

## 📁 Repository Structure

```
├── README.md                      # Master repository documentation (this file)
├── BACKEND_INTEGRATION.md         # Detailed guide for wiring real UCP / gRPC / DB
├── FRONTEND_GUIDE.md              # Component architecture & Sleek Design tokens
├── AGENT_SPECS.md                 # Agent interaction rules & system prompt designs
│
├── agent/                         # Long Horizon Agent definitions & tool schemas
│   ├── long_horizon_agent_spec.json  # Machine-readable ADK tool schemas
│   ├── system_prompts.md             # Orchestration prompts for autonomous agents
│   └── tools_definition.ts           # Type-safe Vertex AI function declarations
│
├── app/                           # Next.js 15+ App Router
│   ├── layout.tsx                 # Root layout with CommerceProvider
│   ├── page.tsx                   # Sleek homepage with search & featured tyres
│   ├── shop/page.tsx              # Multi-faceted filter catalog
│   ├── product/[id]/page.tsx      # Product detail, stock matrix & fitting slots
│   ├── cart/page.tsx              # Basket calculations, VAT & promo logic
│   ├── checkout/page.tsx          # UCP 4-state checkout workflow
│   ├── order/[id]/complete/page.tsx # Order confirmation, PIN pass & survey link
│   ├── survey/[token]/page.tsx    # 0-10 NPS rating & feedback capture
│   ├── demo-controls/page.tsx     # Operator Control Center & Live Event Bus
│   └── api/                       # Next.js Server API Routes (Webhooks & Proxy)
│       ├── ucp/webhook/route.ts   # Inbound UCP webhook handler
│       └── events/route.ts        # Server-side event streaming endpoint
│
├── components/                    # React UI Components
│   ├── CommerceContext.tsx        # Central state, event dispatcher & persistence
│   ├── Navbar.tsx                 # Sleek top navigation & store switcher
│   ├── Footer.tsx                 # Multi-column footer & operational status bar
│   ├── ProductCard.tsx            # High-contrast tyre card with instant CTA
│   ├── StockStatusBadge.tsx       # Standardized stock status pills
│   ├── StoreSelectorModal.tsx     # Depot switcher (Birmingham, Bristol, Croydon)
│   ├── TyreBadge.tsx              # EU Tyre Rating labels (Fuel, Wet Grip, Noise)
│   ├── TyreSearchWidget.tsx       # UK Reg Plate lookup & tyre dimension selector
│   └── IntentModal.tsx            # AP2 pre-authorization intent dialog
│
└── lib/
    ├── data/
    │   └── mockData.ts            # Seed stores, catalog, stock matrix & events
    ├── services/
    │   ├── interfaces.ts          # Core service contracts (ICommerceProvider, etc.)
    │   ├── mockCommerceService.ts # Fully reactive mock service implementation
    │   ├── ucpCommerceProvider.template.ts # Drop-in template for real UCP integration
    │   └── cloudPubSubPublisher.template.ts# Drop-in template for GCP Pub/Sub
    └── types/
        └── commerce.ts            # Domain TypeScript types & schemas
```

---

## 🛠 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm or bun

### Installation
```bash
# Clone the repository
git clone https://github.com/example/cymbal-auto-commerce.git
cd cymbal-auto-commerce

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 Additional Documentation Guides

- [Backend Integration Guide (`BACKEND_INTEGRATION.md`)](./BACKEND_INTEGRATION.md) — How to swap Mock providers with real UCP endpoints, Cloud Pub/Sub, and PostgreSQL.
- [Frontend Development Guide (`FRONTEND_GUIDE.md`)](./FRONTEND_GUIDE.md) — Design tokens, component contracts, and state patterns.
- [Agent Specifications & Tool Schemas (`AGENT_SPECS.md`)](./AGENT_SPECS.md) — Tool specifications for Google ADK and Vertex AI Agent Builder.
