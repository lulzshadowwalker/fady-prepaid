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
}

export type DriverStatus = "idle" | "searching" | "working";
