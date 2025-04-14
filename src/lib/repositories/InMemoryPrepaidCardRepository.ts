import {
  CreatePreapidCardParams,
  PrepaidCardRepository,
} from "@/lib/contracts/prepaid-card-repository";
import { Batch, PrepaidCard } from "../types";
import { faker } from "@faker-js/faker";
import { generateRedemptionCode, randomInRange } from "../utils";
import { InMemoryPrepaidCardTemplateRepository } from "./InMemoryPrepaidCardTemplateRepository";

export class InMemoryPrepaidCardRepository implements PrepaidCardRepository {
  constructor() {
    this.cards = this.factory(randomInRange(5, 12));
  }

  private cards: PrepaidCard[] = [];

  async getAll(): Promise<PrepaidCard[]> {
    return Promise.resolve(this.cards);
  }

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
      status: "active",
      createdAt: new Date().toISOString(),
      seller: faker.string.alpha.name,
    }));

    this.cards.push(...cards);

    return cards;
  }

  async getBatches(): Promise<Batch[]> {
    const batches: Record<string, Batch> = {};

    this.cards.forEach((card) => {
      if (!batches[card.batchId]) {
        batches[card.batchId] = {
          id: card.batchId,
          templateId: card.templateId,
          template: card.template,
          cards: [card],
          createdAt: card.createdAt,
          seller: card.seller!,
        };
        return;
      }

      const batch = batches[card.batchId];
      batch.cards.push(card);
      batches[card.batchId] = batch;
    });

    return Promise.resolve(Object.values(batches));
  }

  public factory(count: number = 1): PrepaidCard[] {
    type Seller = string;
    type BatchId = string;

    const batches: Record<Seller, BatchId>[] = Array.from(
      { length: 3 },
      () => ({ [faker.person.fullName()]: faker.string.uuid() })
    );

    return Array.from({ length: count }, () => {
      const batch = faker.helpers.arrayElement(batches);
      const template = new InMemoryPrepaidCardTemplateRepository().factory(
        1
      )[0];

      return {
        id: faker.string.uuid(),
        batchId: batch[Object.keys(batch)[0]],
        seller: Object.keys(batch)[0],
        redemptionCode: generateRedemptionCode(),

        amount: faker.finance.amount({ min: 5, max: 100 }),
        price: faker.finance.amount({ min: 5, max: 100 }),
        status: faker.helpers.arrayElement(["active", "redeemed"]),
        createdAt: faker.date.recent().toISOString(),
        templateId: template.id,
        template,
      };
    });
  }
}
