import { PassengerWalletSummary } from "../types";

/**
 * Repository contract for fetching wallet summaries
 */
export interface PassengerWalletRepository {
  /**
   * Get the wallet summary for a single driver
   */
  getSummary(driverUid: string): Promise<PassengerWalletSummary | undefined>;
}
