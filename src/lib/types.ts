export type PrepaidCardTemplate = {
  //  TODO: Price does not have to be the same as the amount!!!!!!!!!!
  id: string;
  amount: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
}
