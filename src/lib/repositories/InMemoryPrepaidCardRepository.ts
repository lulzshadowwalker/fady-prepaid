import { CreatePreapidCardParams, PrepaidCardRepository } from '@/lib/contracts/prepaid-card-repository';
import { PrepaidCard } from '../types';
import { faker } from '@faker-js/faker';

export class InMemoryPrepaidCardRepository implements PrepaidCardRepository {
  private cards: PrepaidCard[] = [];

  async createMany(data: CreatePreapidCardParams): Promise<PrepaidCard[]> {
    const cards: PrepaidCard[] = Array.from({ length: data.count }, (_, i) => ({
      id: faker.string.uuid(),
      templateId: data.template.id,
      template: data.template,
      redemptionCode: `${data.template.amount}-${faker.string.uuid().slice(0, 8)}`,
      amount: data.template.amount,
      price: data.template.price,
      status: 'active',
      createdAt: new Date().toISOString(),
      seller: faker.string.alpha.name,
    }));

    this.cards.push(...cards);

    return cards;
  }
}
