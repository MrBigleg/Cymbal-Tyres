export interface StoreLocation {
  id: string;
  name: string;
  city: string;
  address: string;
  postcode: string;
  phone: string;
  openingHours: string;
  fittingsPerDay: number;
}

export type StockState = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface StoreStockInfo {
  state: StockState;
  quantity: number;
  bayAvailable: boolean;
  nextDeliveryDate?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  tyreSize: string; // e.g. "225/40 R18 92Y"
  width: number;
  profile: number;
  rimSize: number;
  speedRating: string;
  loadIndex: number;
  season: 'Summer' | 'All Season' | 'Winter';
  fuelEfficiency: 'A' | 'B' | 'C' | 'D' | 'E';
  wetGrip: 'A' | 'B' | 'C' | 'D' | 'E';
  noiseLevelDb: number;
  price: number;
  recommendedRetailPrice?: number;
  image: string;
  description: string;
  shortDescription: string;
  features: string[];
  vehicleType: 'Car' | 'EV / Hybrid' | 'SUV / 4x4' | 'Van';
  runFlat: boolean;
  reinforced: boolean;
  stockByStore: Record<string, StoreStockInfo>;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  fittingOption: 'in_store' | 'mobile' | 'delivery_only';
  fittingCostPerUnit: number;
}

export interface Cart {
  items: CartItem[];
  storeId: string;
  subtotal: number;
  fittingTotal: number;
  discount: number;
  discountCode?: string;
  total: number;
}

export type CheckoutStatus =
  | 'ACTIVE'
  | 'STALLED'
  | 'RECOVERY_OFFERED'
  | 'COMPLETED'
  | 'EXPIRED';

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  vehicleReg?: string;
  addressLine1?: string;
  postcode?: string;
}

export interface FittingSlot {
  date: string;
  timeSlot: string;
  bayNumber?: string;
}

export interface CheckoutSession {
  checkoutId: string;
  customer: CustomerInfo;
  lineItems: CartItem[];
  storeId: string;
  fittingSlot?: FittingSlot;
  subtotal: number;
  fittingTotal: number;
  discounts: number;
  discountCode?: string;
  recoveryOfferApplied?: boolean;
  recoveryOfferMessage?: string;
  total: number;
  status: CheckoutStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  paymentMethod?: {
    type: 'simulated_card' | 'simulated_agent_wallet' | 'pay_at_store';
    lastFour?: string;
  };
}

export interface Order {
  orderId: string;
  orderNumber: string;
  checkoutId: string;
  customerId: string;
  customer: CustomerInfo;
  lineItems: CartItem[];
  storeId: string;
  storeName: string;
  storeAddress: string;
  storePostcode: string;
  fittingSlot?: FittingSlot;
  subtotal: number;
  fittingTotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'PAID_SIMULATED' | 'PAY_ON_COLLECTION';
  status: 'CONFIRMED' | 'READY_FOR_FITTING' | 'COMPLETED';
  collectionPin: string;
  surveyToken: string;
  createdAt: string;
}

export type ApprovalMode = 'human_present' | 'automatic';
export type PurchaseIntentStatus =
  | 'waiting_for_stock'
  | 'fulfilled'
  | 'expired'
  | 'cancelled';

export interface PurchaseIntent {
  id: string;
  productId: string;
  productName: string;
  tyreSize: string;
  storeId: string;
  storeName: string;
  quantity: number;
  maxTotalPrice: number;
  unitPriceAtCreation: number;
  expiresAt: string;
  allowSubstitution: boolean;
  approvalMode: ApprovalMode;
  status: PurchaseIntentStatus;
  customerEmail: string;
  customerPhone?: string;
  customerName?: string;
  vehicleReg?: string;
  createdAt: string;
  fulfilledOrderId?: string;
  fulfillmentNote?: string;
}

export interface SurveyResponse {
  surveyToken: string;
  orderId: string;
  locationId: string;
  storeName?: string;
  score: number; // 0-10
  comment?: string;
  customerName?: string;
  submittedAt: string;
}

export interface DomainEvent<T = Record<string, any>> {
  eventId: string;
  eventType:
    | 'commerce.order.completed'
    | 'commerce.checkout.created'
    | 'commerce.checkout.stalled'
    | 'commerce.checkout.recovered'
    | 'commerce.intent.created'
    | 'commerce.intent.fulfilled'
    | 'inventory.replenished'
    | 'inventory.updated'
    | 'commerce.survey.submitted';
  timestamp: string;
  payload: T;
}
