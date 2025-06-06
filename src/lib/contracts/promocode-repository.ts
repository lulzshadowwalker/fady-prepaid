import { Promocode } from "../types";

/**
 * Repository contract for managing promocodes
 */
export interface PromocodeRepository {
  /**
   * List all promocodes
   */
  list(): Promise<Promocode[]>;

  /**
   * Create a new promocode
   */
  create(promocode: Omit<Promocode, "id" | "createdAt" | "usageCount" | "usagePerUser">): Promise<Promocode>;

  /**
   * Update an existing promocode
   */
  update(id: string, updated: Partial<Omit<Promocode, "id" | "createdAt" | "usageCount" | "usagePerUser">>): Promise<Promocode>;

  /**
   * Delete a promocode by ID
   */
  delete(id: string): Promise<void>;


}