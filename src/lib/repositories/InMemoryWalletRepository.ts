import { faker } from "@faker-js/faker";
import { injectable } from "tsyringe";
import { WalletSummary } from "@/lib/types";
import { WalletRepository } from "../contracts/wallet-repository";

/**
 * In-memory implementation of WalletRepository, with fake data
 */
@injectable()
export class InMemoryWalletRepository implements WalletRepository {
  async getSummary(driverUid: string): Promise<WalletSummary | undefined> {
    const summary = this.factory(1)[0];
    summary.driverUid = driverUid;
    return Promise.resolve(summary);
  }

  public factory(count: number = 1): WalletSummary[] {
    return Array.from({ length: count }, () => {
      const actual = parseFloat(
        faker.finance.amount({ min: 0, max: 1000, dec: 2 }),
      );
      const added = parseFloat(
        faker.finance.amount({ min: 0, max: 200, dec: 2 }),
      );
      return {
        driverUid: faker.string.uuid(),
        actualBalance: actual,
        addedBalance: added,
        totalBalance: actual + added,
      };
    });
  }
}
