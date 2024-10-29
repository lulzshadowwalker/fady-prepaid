import { CreatePreapidCardParams, PrepaidCardRepository } from '@/lib/contracts/prepaid-card-repository';
import { PrepaidCard } from '../types';
import { faker } from '@faker-js/faker';
import { generateRedemptionCode } from '../utils';

export class InMemoryPrepaidCardRepository implements PrepaidCardRepository {
  private cards: PrepaidCard[] = [];

  async createMany(data: CreatePreapidCardParams): Promise<PrepaidCard[]> {
    const batchId = faker.string.uuid();

    const cards: PrepaidCard[] = Array.from({ length: data.count }, (_, i) => ({
      id: faker.string.uuid(),
      batchId: batchId,
      templateId: data.template.id,
      template: data.template,
      redemptionCode: generateRedemptionCode(),
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
