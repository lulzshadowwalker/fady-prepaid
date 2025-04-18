import { Driver } from "../types";
import { faker } from "@faker-js/faker";
import { randomInRange } from "../utils";
import { DriverRepository } from "../contracts/driver-repository";

export class InMemoryDriverRepository implements DriverRepository {
  constructor() {
    this.drivers = this.factory(randomInRange(24, 50));
  }

  private drivers: Driver[] = [];

  async getAll(): Promise<Driver[]> {
    return Promise.resolve(this.drivers);
  }

  public factory(count: number = 1): Driver[] {
    return Array.from({ length: count }, () => {
      return {
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
    });
  }
}
