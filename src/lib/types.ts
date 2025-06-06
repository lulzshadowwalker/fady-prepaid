export type PrepaidCardTemplate = {
  id: string;
  amount: string;
  price: string;
  name: string;
  status: "active" | "inactive";
  createdAt: string;
};

export type PrepaidCard = {
  id: string;
  batchId: string;
  templateId: string;
  template: PrepaidCardTemplate;
  redemptionCode: string;
  amount: string;
  price: string;
  status: "active" | "redeemed";
  createdAt: string;
  seller?: string;
};

export type Batch = {
  id: string;
  cards: PrepaidCard[];
  templateId: string;
  template: PrepaidCardTemplate;
  createdAt: string;
  seller: string;
};

export type GetPoint = {
  latitude: number;
  longitude: number;
};

export type Partner = {
  id: string;
  nameEn: string;
  nameAr: string;
  logo: string; // URL or base64 string
  createdAt: string;
};

export type Driver = {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  location?: GetPoint;
  status: DriverStatus;
  walletSummary?: WalletSummary;
};

export type DriverStatus = "idle" | "searching" | "working";

export type TransactionType = "topup" | "transfer";

// --- Promocode Rule Types ---

export type PromocodeRule =
  | { type: "gender"; gender: "male" | "female" }
  | { type: "expiration"; expiresAt: string } // ISO date string
  | { type: "maxUses"; maxUses: number }
  | { type: "maxUsesPerUser"; maxUses: number }
  | { type: "timeOfDay"; from: string; to: string } // "HH:mm" 24h format
  // Add more rule types as needed
  ;

// --- Promocode Type ---

export type Promocode = {
  id: string;
  code: string; // the code users enter
  description?: string;
  discountType: "amount" | "percent";
  discountValue: number;
  active: boolean;
  createdAt: string;
  createdBy?: string;
  rules?: PromocodeRule[];
  usageCount: number; // total times used
  usagePerUser?: Record<string, number>; // userId -> times used
};

// a single row in your dashboard’s transaction table
export interface WalletTx {
  id: string; // doc ID
  date: Date; // createdAt.toDate()
  type: TransactionType;
  amount: number; // for topup: cardValue; for transfer: moved amount
  source: string; // e.g. "Prepaid Card" or counterparty name
  direction?: "in" | "out"; // only for transfers
}

export interface WalletSummary {
  driverUid: string; // driver ID
  actualBalance: number; // real paid/received money
  addedBalance: number; // promo, signup credit, etc.
  totalBalance: number; // sum of the two
}

export interface CashoutRequest {
  id: string;
  driver?: Driver;
  driverUid: string;
  amount: number; // requested amount
  actualAmount?: number | null; // actual amount sent to driver (may be <= amount)
  status: "pending" | "approved" | "rejected";
  transferMethod: "cliq" | "iban";
  iban?: string;
  cliq?: {
    alias?: string;
    phone?: string;
    wallet: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
