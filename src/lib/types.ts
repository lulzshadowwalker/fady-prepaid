export type PrepaidCardTemplate = {
  id: string;
  amount: string;
  price: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
};

export type PrepaidCard = {
  id: string;
  templateId: string;
  template: PrepaidCardTemplate;
  redemptionCode: string;
  amount: string;
  price: string;
  status: 'active' | 'redeemed';
  createdAt: string; // Timestamp when the card instance was created
  seller?: string;
};
