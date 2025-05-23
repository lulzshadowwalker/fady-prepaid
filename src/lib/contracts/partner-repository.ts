import { Partner } from "@/lib/types";

/**
 * Repository contract for managing partners
 */
export interface PartnerRepository {
  /**
   * Fetch all partners
   */
  getAll(): Promise<Partner[]>;

  /**
   * Create a new partner
   */
  create(partner: Omit<Partner, "id">): Promise<Partner>;

  /**
   * Update an existing partner
   */
  update(id: string, updated: Partial<Omit<Partner, "id">>): Promise<Partner>;

  /**
   * Delete a partner by ID
   */
  delete(id: string): Promise<void>;
}
