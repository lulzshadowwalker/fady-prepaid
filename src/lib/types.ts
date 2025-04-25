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

export type Driver = {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  location?: GetPoint;
  status: DriverStatus;
  walletSummary?: WalletSummary;
}

export type DriverStatus = "idle" | "searching" | "working";

export type TransactionType = "topup" | "transfer";

// a single row in your dashboard’s transaction table
export interface WalletTx {
  id: string;                    // doc ID
  date: Date;                    // createdAt.toDate()
  type: TransactionType;
  amount: number;                // for topup: cardValue; for transfer: moved amount
  source: string;                // e.g. "Prepaid Card" or counterparty name
  direction?: "in" | "out";      // only for transfers
}

export interface WalletSummary {
  driverUid: string;             // driver ID
  actualBalance: number;         // real paid/received money
  addedBalance: number;          // promo, signup credit, etc.
  totalBalance: number;          // sum of the two
}

export interface CashoutRequest {
  id: string;
  driver: Driver;
  driverUid: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}
