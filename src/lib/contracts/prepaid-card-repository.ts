import { PrepaidCard, PrepaidCardTemplate } from '@types';

export type CreatePreapidCardParams = {
  count: number;
  template: PrepaidCardTemplate;
  seller?: string;
};

export interface PrepaidCardRepository {
  createMany(data: CreatePreapidCardParams): Promise<PrepaidCard[]>;
}
