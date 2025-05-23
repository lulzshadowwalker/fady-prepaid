import { CashoutRequest } from "@types";

// Repository contract for managing cashout requests
export interface CashoutRequestRepository {
  /**
   * Fetch all cashout requests (with optional filtering)
   */
  getAll(): Promise<CashoutRequest[]>;

  /**
   * Fetch a single request by ID
   */
  getById(id: string): Promise<CashoutRequest | undefined>;

  /**
   * Approve a pending request
   */
  approve(id: string, actualAmount: number): Promise<void>

  /**
   * Reject a pending request
   */
  reject(id: string): Promise<void>;
}
