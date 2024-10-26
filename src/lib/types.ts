export type PrepaidCardTemplate = {
  id: string;
  amount: string;
  price: string;
  name: string;
  status: "active" | "inactive";
  createdAt: string;
};
