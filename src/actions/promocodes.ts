'use server';

import { promocodeRepository } from '@/lib/container';
import { Promocode } from '@/lib/types';

const repository = promocodeRepository();

/**
 * List all promocodes
 */
export async function listPromocodes(): Promise<Promocode[]> {
  return await repository.list();
}

/**
 * Create a new promocode
 */
export async function createPromocode(
  promocode: Omit<Promocode, 'id' | 'createdAt' | 'usageCount' | 'usagePerUser'>
): Promise<Promocode> {
  return await repository.create(promocode);
}

/**
 * Update an existing promocode
 */
export async function updatePromocode(
  id: string,
  updated: Partial<Omit<Promocode, 'id' | 'createdAt' | 'usageCount' | 'usagePerUser'>>
): Promise<Promocode> {
  return await repository.update(id, updated);
}

/**
 * Delete a promocode by ID
 */
export async function deletePromocode(id: string): Promise<void> {
  return await repository.delete(id);
}