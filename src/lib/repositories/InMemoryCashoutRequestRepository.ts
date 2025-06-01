import { faker } from "@faker-js/faker";
import { CashoutRequestRepository } from "../contracts/cashout-request-repository";
import { CashoutRequest } from "../types";
import { InMemoryDriverRepository } from "./InMemoryDriverRepository";

// In-memory implementation (for local development or testing)
export class InMemoryCashoutRequestRepository
  implements CashoutRequestRepository
{
  private requests: CashoutRequest[];
  private driverRepo = new InMemoryDriverRepository();

  constructor(initialCount: number = 10) {
    this.requests = this.factory(initialCount);
  }

  /**
   * Generate fake CashoutRequest data, including a fake driver
   */
  private factory(count: number): CashoutRequest[] {
    return Array.from({ length: count }, () => {
      const driver = this.driverRepo.factory(1, { withWalletSummary: true })[0];
      const created = faker.date.recent({ days: 30 });
      const transferMethod = faker.helpers.arrayElement<
        CashoutRequest["transferMethod"]
      >(["cliq", "iban"]);

      let iban: string | undefined;
      let cliq: CashoutRequest["cliq"] | undefined;

      if (transferMethod === "iban") {
        iban = faker.finance.iban();
      } else {
        const hasAlias = faker.helpers.arrayElement([true, false]);

        cliq = {
          alias: hasAlias ? faker.person.lastName() : undefined,
          phone: !hasAlias ? faker.phone.number() : undefined,
          wallet: faker.finance.accountName(),
        };
      }

      const status = faker.helpers.arrayElement<CashoutRequest["status"]>([
        "pending",
        "approved",
        "rejected",
      ]);
      const updated =
        status === "pending"
          ? created
          : faker.date.between({ from: created, to: new Date() });

      return {
        id: faker.string.uuid(),
        driverUid: driver.id,
        driver,
        amount: parseFloat(faker.finance.amount({ min: 5, max: 500, dec: 2 })),
        status,
        transferMethod,
        iban,
        cliq,
        createdAt: created,
        updatedAt: updated,
      };
    });
  }

  async getAll(): Promise<CashoutRequest[]> {
    return [...this.requests];
  }

  async getById(id: string): Promise<CashoutRequest | undefined> {
    return this.requests.find((r) => r.id === id);
  }

  async approve(id: string): Promise<void> {
    const req = await this.getById(id);
    if (!req) throw new Error(`Request ${id} not found`);
    if (req.status !== "pending")
      throw new Error(`Cannot approve a request with status ${req.status}`);
    req.status = "approved";
    req.updatedAt = new Date();
  }

  async reject(id: string): Promise<void> {
    const req = await this.getById(id);
    if (!req) throw new Error(`Request ${id} not found`);
    if (req.status !== "pending")
      throw new Error(`Cannot reject a request with status ${req.status}`);
    req.status = "rejected";
    req.updatedAt = new Date();
  }
}
