'use server';

import { prepaidCardRepository } from '@/lib/container';
import { CreatePreapidCardParams } from '@/lib/contracts/prepaid-card-repository';
import { PrepaidCard } from '@/lib/types';

const repository = prepaidCardRepository();

export async function createManyPrepaidCards(data: CreatePreapidCardParams): Promise<PrepaidCard[]> {
  return await repository.createMany(data);
}
