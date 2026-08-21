# Google ADK / Long Horizon Agent Specifications

This document outlines the autonomous agent roles, system prompt architecture, tool contracts, and event triggers designed to integrate with **Cymbal Auto** via the **Google Agent Development Kit (ADK)** and **Vertex AI Agent Builder**.

---

## 🤖 Active Agent Archetypes

```
                                    ┌───────────────────────────────┐
                                    │    Master Orchestrator Agent  │
                                    └──────────────┬────────────────┘
                                                   │
                ┌──────────────────────────────────┼─────────────────────────────────┐
                │                                  │                                 │
                ▼                                  ▼                                 ▼
┌───────────────────────────────┐  ┌───────────────────────────────┐  ┌───────────────────────────────┐
│   Inventory Monitor & AP2     │  │   Checkout Recovery Agent     │  │   Customer Satisfaction &     │
│   Execution Agent             │  │   (Friction Optimizer)        │  │   Retention Agent             │
└───────────────────────────────┘  └───────────────────────────────┘  └───────────────────────────────┘
```

---

## 1. Inventory & Autonomous Intent Agent (AP2)

### Mission
Monitors stock events (`inventory.replenished`). When tyres arrive at a depot, it evaluates pre-authorized conditional purchase intents (`purchase_intents`), checks price caps, and executes auto-orders without requiring synchronous customer presence.

### Trigger Event
- Event: `inventory.replenished`
- Payload: `{ productId: string, storeId: string, addedQuantity: number, newQuantity: number }`

### Decision Protocol
1. Fetch all pending intents for `productId` and `storeId` using `getIntents({ productId, storeId, status: 'PENDING_STOCK' })`.
2. For each intent:
   - Calculate `totalCost = product.price * intent.targetQuantity`.
   - Verify `totalCost <= intent.maxPriceCap`.
   - Check if `intent.expiryDate > currentTime`.
   - If conditions pass and `autoExecuteAp2 == true`:
     - Call tool `fulfillPurchaseIntent({ intentId, note: 'Autonomous AP2 Stock Replenishment Execution' })`.
     - Automatically reserve workshop fitting slot or assign default bay pass.
     - Dispatch notification email/SMS to customer with check-in PIN.

---

## 2. Checkout Recovery & Friction Agent

### Mission
Monitors stalled cart sessions (`commerce.checkout.stalled`), analyzes the point of friction (e.g. unexpected price barrier, unavailable fitting slot, hesitation at payment), and formulates an intelligent recovery offer within bounded discount margins.

### Trigger Event
- Event: `commerce.checkout.stalled`
- Payload: `{ checkoutId: string, customerEmail: string, stalledStep: string, items: Array<CartItem>, total: number }`

### Policy & Guardrails
- Maximum recovery discount: **10%** (or free laser wheel alignment value of £35).
- Frequency limiter: Maximum 1 recovery incentive per customer email per 30 days.
- Recovery message tone: Helpful, non-intrusive automotive specialist.

### Tool Invocation
- Call tool `applyCheckoutRecovery({ checkoutId, discountPercent: 10, message: "We noticed you hesitated at the fitting schedule step. We've reserved your tyre set and applied an instant 10% discount to secure your slot." })`.

---

## 3. Customer Satisfaction & Post-Purchase NPS Agent

### Mission
Analyzes post-purchase customer feedback events (`customer.survey.submitted`). Triages detractors, passives, and promoters to initiate automatic escalations or review requests.

### Trigger Event
- Event: `customer.survey.submitted`
- Payload: `{ orderId: string, rating: number (0-10), feedback: string, customerEmail: string }`

### Routing Rules
- **Rating 0–6 (Detractor)**:
  - Flag for Autocentre Service Manager escalation.
  - Automatically create a high-priority support ticket with sentiment analysis breakdown.
- **Rating 7–8 (Passive)**:
  - Log feedback to depot quality ledger.
- **Rating 9–10 (Promoter)**:
  - Send automated thank-you with a direct Google Business / Trustpilot review link.

---

## 🛠 Complete Tool Calling Schema

See full JSON schemas in [`/agent/long_horizon_agent_spec.json`](./agent/long_horizon_agent_spec.json) and TypeScript declarations in [`/agent/tools_definition.ts`](./agent/tools_definition.ts).
