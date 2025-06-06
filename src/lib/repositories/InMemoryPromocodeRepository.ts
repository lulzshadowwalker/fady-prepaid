import { faker } from "@faker-js/faker";
import { Promocode, PromocodeRule } from "../types";
import { PromocodeRepository } from "../contracts/promocode-repository";

/**
 * In-memory implementation of PromocodeRepository, with fake data and rule logic.
 */
export class InMemoryPromocodeRepository implements PromocodeRepository {
  private promocodes: Promocode[] = [];

  constructor(initialCount: number = 10) {
    this.promocodes = this.factory(initialCount);
  }

  async list(): Promise<Promocode[]> {
    return [...this.promocodes];
  }

  async create(
    promocode: Omit<Promocode, "id" | "createdAt" | "usageCount" | "usagePerUser">
  ): Promise<Promocode> {
    const now = new Date().toISOString();
    const code: Promocode = {
      ...promocode,
      id: faker.string.uuid(),
      createdAt: now,
      usageCount: 0,
      usagePerUser: {},
    };
    this.promocodes.push(code);
    return code;
  }

  async update(
    id: string,
    updated: Partial<Omit<Promocode, "id" | "createdAt" | "usageCount" | "usagePerUser">>
  ): Promise<Promocode> {
    const promo = this.promocodes.find((p) => p.id === id);
    if (!promo) throw new Error("Promocode not found");
    Object.assign(promo, updated);
    return promo;
  }

  async delete(id: string): Promise<void> {
    this.promocodes = this.promocodes.filter((p) => p.id !== id);
  }



  /**
   * Generate fake promocodes for testing.
   */
  public factory(count: number = 1): Promocode[] {
    const possibleRules: (() => PromocodeRule)[] = [
      () =>
        faker.helpers.arrayElement([
          { type: "gender", gender: "male" },
          { type: "gender", gender: "female" },
        ]),
      () => ({
        type: "expiration",
        expiresAt: faker.date.soon({ days: 30 }).toISOString(),
      }),
      () => ({
        type: "maxUses",
        maxUses: faker.number.int({ min: 1, max: 100 }),
      }),
      () => ({
        type: "maxUsesPerUser",
        maxUses: faker.number.int({ min: 1, max: 5 }),
      }),
      () => ({
        type: "timeOfDay",
        from: "08:00",
        to: "20:00",
      }),
    ];

    return Array.from({ length: count }, () => {
      // Randomly assign 0-2 rules
      const rules: PromocodeRule[] = faker.helpers
        .arrayElements(possibleRules, faker.number.int({ min: 0, max: 2 }))
        .map((fn) => fn());

      return {
        id: faker.string.uuid(),
        code: faker.string.alphanumeric({ length: 8 }).toUpperCase(),
        description: faker.lorem.sentence(),
        discountType: faker.helpers.arrayElement(["amount", "percent"]),
        discountValue: faker.number.int({ min: 5, max: 50 }),
        active: faker.datatype.boolean(),
        createdAt: faker.date.recent({ days: 60 }).toISOString(),
        createdBy: faker.internet.userName(),
        rules: rules.length > 0 ? rules : undefined,
        usageCount: faker.number.int({ min: 0, max: 100 }),
        usagePerUser: {},
      };
    });
  }
}