import {
  CreatePrepaidCardTemplateParams,
  PrepaidCardTemplateRepository,
} from "../contracts/prepaid-card-template-repository";
import { PrepaidCardTemplate } from "../types";
import { faker } from "@faker-js/faker";
import { randomInRange } from "../utils";

export class InMemoryPrepaidCardTemplateRepository
  implements PrepaidCardTemplateRepository
{
  private templates: PrepaidCardTemplate[] = [];

  constructor() {
    this.templates = this.factory(randomInRange(5, 12));
  }

  async create(
    template: CreatePrepaidCardTemplateParams
  ): Promise<PrepaidCardTemplate> {
    const t: PrepaidCardTemplate = {
      id: faker.string.uuid(),
      amount: template.amount,
      price: template.price,
      name: template.name,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    this.templates.push(t);

    return t;
  }

  async getAll(): Promise<PrepaidCardTemplate[]> {
    return Array.from(this.templates);
  }

  async update(
    template: PrepaidCardTemplate,
    updated: Partial<PrepaidCardTemplate>
  ): Promise<PrepaidCardTemplate> {
    const t = this.templates.find((t) => t.id === template.id);

    if (!t) {
      throw new Error("Template not found");
    }

    Object.assign(t, updated);

    return t;
  }

  public factory(count: number = 1): PrepaidCardTemplate[] {
    return Array.from({ length: count }, () => {
      return {
        id: faker.string.uuid(),
        amount: faker.finance.amount({ min: 5, max: 100 }),
        price: faker.finance.amount({ min: 5, max: 100 }),
        name: faker.word.words(3),
        status: faker.helpers.arrayElement(["active", "inactive"]),
        createdAt: faker.date.recent().toISOString(),
      };
    });
  }
}
