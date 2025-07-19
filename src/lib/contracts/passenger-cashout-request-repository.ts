import { PassengerCashoutRequest } from "@types";

// Repository contract for managing passenger cashout requests
export interface PassengerCashoutRequestRepository {
  /**
   * Fetch all cashout requests (with optional filtering)
   */
  getAll(): Promise<PassengerCashoutRequest[]>;

  /**
   * Fetch a single request by ID
   */
  getById(id: string): Promise<PassengerCashoutRequest | undefined>;

  /**
   * Approve a pending request
   */
  approve(id: string, actualAmount: number): Promise<void>

  /**
   * Reject a pending request
   */
  reject(id: string): Promise<void>;
}
