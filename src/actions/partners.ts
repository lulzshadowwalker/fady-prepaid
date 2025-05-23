'use server';

import { partnerRepository } from '@/lib/container';
import { Partner } from '@/lib/types';

const repository = partnerRepository();

export async function getPartners(): Promise<Partner[]> {
  return await repository.getAll();
}

export async function createPartner(
  partner: Omit<Partner, 'id'>
): Promise<Partner> {
  return await repository.create(partner);
}

export async function updatePartner(
  id: string,
  updated: Partial<Omit<Partner, 'id'>>
): Promise<Partner> {
  return await repository.update(id, updated);
}

export async function deletePartner(id: string): Promise<void> {
  return await repository.delete(id);
}
