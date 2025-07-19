import { Passenger } from "../types";
import { faker } from "@faker-js/faker";
import { randomInRange } from "../utils";
import { InMemoryPassengerWalletRepository } from "./InMemoryPassengerWalletRepository";
import { PassengerRepository } from "../contracts/passenger-repository";

export class InMemoryPassengerRepository implements PassengerRepository {
  constructor() {
    this.passengers = this.factory(randomInRange(24, 50));
  }

  private passengers: Passenger[] = [];

  async getAll(): Promise<Passenger[]> {
    return Promise.resolve(this.passengers);
  }

  public factory(
    count: number = 1,
    opts?: { withWalletSummary?: boolean },
  ): Passenger[] {
    return Array.from({ length: count }, () => {
      const passenger: Passenger = {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
      };

      if (opts?.withWalletSummary) {
        passenger.walletSummary = new InMemoryPassengerWalletRepository().factory(1)[0];
        passenger.walletSummary!.passengerUid = passenger.id;
      }

      return passenger;
    });
  }
}
