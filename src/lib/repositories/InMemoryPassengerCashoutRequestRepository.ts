import { faker } from "@faker-js/faker";
import { injectable } from "tsyringe";
import { PassengerCashoutRequest } from "../types";
import { PassengerCashoutRequestRepository } from "../contracts/passenger-cashout-request-repository";
import { InMemoryPassengerRepository } from "./InMemoryPassengerRepository";

// In-memory implementation (for local development or testing)
@injectable()
export class InMemoryPassengerCashoutRequestRepository
  implements PassengerCashoutRequestRepository
{
  private requests: PassengerCashoutRequest[];
  private passengerRepo = new InMemoryPassengerRepository();

  constructor() {
    this.requests = this.factory(10);
  }

  /**
   * Generate fake CashoutRequest data, including a fake passenger.
   */
  private factory(count: number): PassengerCashoutRequest[] {
    return Array.from({ length: count }, () => {
      const passenger = this.passengerRepo.factory(1, { withWalletSummary: true })[0];
      const created = faker.date.recent({ days: 30 });
      const transferMethod = faker.helpers.arrayElement<
        PassengerCashoutRequest["transferMethod"]
      >(["cliq", "iban"]);

      let iban: string | undefined;
      let cliq: PassengerCashoutRequest["cliq"] | undefined;

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

      const status = faker.helpers.arrayElement<PassengerCashoutRequest["status"]>([
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
        passengerUid: passenger.id,
        passenger,
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

  async getAll(): Promise<PassengerCashoutRequest[]> {
    return [...this.requests];
  }

  async getById(id: string): Promise<PassengerCashoutRequest | undefined> {
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
