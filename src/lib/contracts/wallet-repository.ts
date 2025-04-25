import { WalletSummary } from "@/lib/types";

/**
 * Repository contract for fetching wallet summaries
 */
export interface WalletRepository {
  /**
   * Get the wallet summary for a single driver
   */
  getSummary(driverUid: string): Promise<WalletSummary | undefined>;
}
