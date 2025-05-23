import { Driver } from "../types";
import { faker } from "@faker-js/faker";
import { randomInRange } from "../utils";
import { DriverRepository } from "../contracts/driver-repository";
import { InMemoryWalletRepository } from "./InMemoryWalletRepository";

export class InMemoryDriverRepository implements DriverRepository {
  constructor() {
    this.drivers = this.factory(randomInRange(24, 50));
  }

  private drivers: Driver[] = [];

  async getAll(): Promise<Driver[]> {
    return Promise.resolve(this.drivers);
  }

  public factory(
    count: number = 1,
    opts?: { withWalletSummary?: boolean },
  ): Driver[] {
    return Array.from({ length: count }, () => {
      const driver: Driver = {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        phone: faker.phone.number(),
        location: {
          latitude: faker.location.latitude({ min: 29.2, max: 33.4 }),
          longitude: faker.location.longitude({ min: 34.9, max: 39.3 }),
        },
        avatar: faker.image.avatar(),
        status: faker.helpers.arrayElement(["idle", "searching", "working"]),
      };

      if (opts?.withWalletSummary) {
        driver.walletSummary = new InMemoryWalletRepository().factory(1)[0];
        driver.walletSummary!.driverUid = driver.id;
      }

      return driver;
    });
  }
}
