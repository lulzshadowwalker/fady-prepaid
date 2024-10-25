export type PrepaidCardTemplate = {
  id: string;
  amount: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
}
