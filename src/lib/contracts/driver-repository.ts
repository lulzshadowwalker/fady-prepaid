import { Driver } from "@types";

export interface DriverRepository {
  getAll(options?: { withLocations: boolean }): Promise<Driver[]>;
}
