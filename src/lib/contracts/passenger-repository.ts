import { Passenger } from "@types";

export interface PassengerRepository {
  getAll(options?: { withLocations: boolean }): Promise<Passenger[]>;
}
