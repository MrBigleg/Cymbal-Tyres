# Frontend Architecture & Design System Guide

This document describes the frontend structure, state lifecycle, design tokens, and component contracts for **Cymbal Auto**.

---

## 🎨 Design System: "Sleek Interface" Theme

Cymbal Auto uses a refined slate & electric blue visual language designed for high density, visual clarity, and responsiveness.

### Color Palette & Semantic Tokens
- **Backgrounds**: `bg-slate-900` (Header / High-contrast accents), `bg-slate-50` (Page body), `bg-white` (Cards & containers).
- **Brand Accent**: `bg-blue-600` / `hover:bg-blue-700` (`#2563eb`), with subtle `shadow-blue-600/20` shadows.
- **Borders**: `border-slate-200` (Default), `border-slate-800` (Dark containers), `border-rose-100` (Out of stock highlights).
- **Stock Badges**:
  - `In Stock`: `bg-emerald-100 text-emerald-700` uppercase pill.
  - `Low Stock`: `bg-amber-100 text-amber-700` uppercase pill.
  - `Out of Stock`: `bg-rose-100 text-rose-700` uppercase pill.

### Typography
- **Primary Font**: Modern sans-serif stack (`Inter`, `system-ui`).
- **Vehicle Reg Plate**: Monospace bold uppercase (`font-mono font-black text-slate-950 bg-amber-400`).
- **Technical Specs**: Dense uppercase metadata (`text-[10px] font-bold text-slate-400 uppercase tracking-wider`).

---

## 🧩 Key Component Catalog

### 1. `Navbar.tsx`
- **Location**: `/components/Navbar.tsx`
- **Features**:
  - Persistent brand logo with circular icon.
  - Live selected store switcher pill with instant modal trigger.
  - Global query search bar routing to `/shop?q=...`.
  - Dynamic cart counter badge with live total.
  - Sub-navigation bar with category quick filters (`All Tyres`, `Winter Tyres`, `EV Ready`, `Performance`) and quick tyre dimension picker.

### 2. `ProductCard.tsx`
- **Location**: `/components/ProductCard.tsx`
- **Features**:
  - Store-aware stock resolution (`product.stockByStore[selectedStoreId]`).
  - EU Tyre Ratings Badge (`TyreBadge.tsx` displaying Fuel, Wet Grip, Noise dB).
  - Out of stock branch: automatically renders the `Buy when back in stock` CTA linking to `IntentModal.tsx`.
  - In-stock branch: renders the `Add to Basket` button with quick feedback.

### 3. `TyreSearchWidget.tsx`
- **Location**: `/components/TyreSearchWidget.tsx`
- **Features**:
  - Dual-mode selector: UK Registration Plate Lookup (`reg`) and Tyre Dimension (`size` - Width / Profile / Rim).
  - Realistic yellow UK plate styling with blue GB/UK band.
  - One-click popular sizes shortcuts (e.g. `205/55 R16`, `225/40 R18`).

### 4. `StoreSelectorModal.tsx`
- **Location**: `/components/StoreSelectorModal.tsx`
- **Features**:
  - Modal overlay allowing seamless depot switching between **Birmingham Central**, **Bristol Cribbs**, and **Croydon Purley Way**.
  - Displays address, phone, opening hours, bay capacity, and instant "Switch to this Centre" action.
  - Automatically persists the choice in browser `localStorage` and synchronizes `CommerceContext`.

### 5. `IntentModal.tsx`
- **Location**: `/components/IntentModal.tsx`
- **Features**:
  - AP2 pre-authorization workflow for out-of-stock items.
  - Allows customers to specify target quantity, maximum total price tolerance, expiry timeframe (7 / 14 / 30 / 60 days), and substitute preferences.
  - Emits `commerce.purchase_intent.created`.

---

## ⚡ State Management (`CommerceContext.tsx`)

The application uses React Context (`/components/CommerceContext.tsx`) as the single source of truth for:
- `stores`: List of physical autocentres.
- `selectedStoreId` & `selectedStore`: Active store location.
- `products`: Product catalog with store-specific stock numbers.
- `cart`: Active basket with calculation helpers for subtotal, VAT (20%), fitting fees, and discount codes.
- `activeCheckout`: Current checkout session and lifecycle state.
- `recentEvents`: Live stream of domain events for telemetry and demo inspections.

### Reactive Pub/Sub Listeners
`CommerceContext` subscribes to the service layer's state emitter:
```typescript
useEffect(() => {
  const unsubscribe = mockCommerceService.subscribeToState((type, payload) => {
    // Automatically re-fetches products, cart, stores, and events when mutations happen
    refreshData();
  });
  return () => unsubscribe();
}, []);
```
This ensures that when an operator adjusts inventory or triggers an agent recovery in `/demo-controls`, all other open tabs and components update immediately without needing a manual browser refresh.

---

## 🗺 Application Routes

| Route | Purpose | Key Components |
|---|---|---|
| `/` | Homepage & Hero | `TyreSearchWidget`, Featured Tyres, Service Highlights, Store Hub |
| `/shop` | Tyre Catalog & Multi-Filter | Brand, Season, Vehicle Type, Stock state filters, Sorting |
| `/product/[id]` | Product Detail Page | Full specs, Depot stock table, Workshop bay scheduler, Fitting choice |
| `/cart` | Basket & Fitting Options | Item quantity, Fitting selection (In-Store vs Mobile), Promo code |
| `/checkout` | 4-Stage UCP Checkout | Vehicle details, Customer info, Slot pick, Simulated payment, Stall/Recovery hooks |
| `/order/[id]/complete` | Order Confirmation & Pass | Workshop Bay Pass, Fitting Check-In PIN, Survey Link |
| `/survey/[token]` | Post-Purchase NPS Survey | 0–10 Net Promoter Score rating, qualitative feedback |
| `/demo-controls` | Operator Control Center | Inventory modifier, Checkout staller, Order table, Live event bus |

---

## 🧪 Testing & Verification
- **Linter**: `npm run lint`
- **Typecheck & Build**: `npm run build`
