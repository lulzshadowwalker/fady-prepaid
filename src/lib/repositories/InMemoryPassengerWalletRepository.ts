import { faker } from "@faker-js/faker";
import { injectable } from "tsyringe";
import { PassengerWalletSummary } from "@/lib/types";
import { PassengerWalletRepository } from "../contracts/passenger-wallet-repository";

/**
 * In-memory implementation of WalletRepository, with fake data
 */
@injectable()
export class InMemoryPassengerWalletRepository implements PassengerWalletRepository {
  async getSummary(passengerUid: string): Promise<PassengerWalletSummary | undefined> {
    const summary = this.factory(1)[0];
    summary.passengerUid = passengerUid;
    return Promise.resolve(summary);
  }

  public factory(count: number = 1): PassengerWalletSummary[] {
    return Array.from({ length: count }, () => {
      const actual = parseFloat(
        faker.finance.amount({ min: 0, max: 1000, dec: 2 }),
      );
      const added = parseFloat(
        faker.finance.amount({ min: 0, max: 200, dec: 2 }),
      );
      return {
        passengerUid: faker.string.uuid(),
        actualBalance: actual,
        addedBalance: added,
        totalBalance: actual + added,
      };
    });
  }
}
