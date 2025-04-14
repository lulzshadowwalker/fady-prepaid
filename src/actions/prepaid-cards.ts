"use server";

import { prepaidCardRepository } from "@/lib/container";
import { CreatePreapidCardParams } from "@/lib/contracts/prepaid-card-repository";
import { Batch, PrepaidCard } from "@/lib/types";

const repository = prepaidCardRepository();

export async function createManyPrepaidCards(
  data: CreatePreapidCardParams
): Promise<PrepaidCard[]> {
  return await repository.createMany(data);
}

export async function getPrepaidCards(): Promise<PrepaidCard[]> {
  return await repository.getAll();
}

export async function getBatches(): Promise<Batch[]> {
  return await repository.getBatches();
}
