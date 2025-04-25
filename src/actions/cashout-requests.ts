"use server";

import { cashoutRequestRepository } from "@/lib/container";
import { CashoutRequest } from "@/lib/types";

const repository = cashoutRequestRepository();

export async function getCashoutRequests(): Promise<CashoutRequest[]> {
  return await repository.getAll();
}

export async function approveCashoutRequest(id: string): Promise<void> {
  return await repository.approve(id);
}

export async function rejectCashoutRequest(id: string): Promise<void> {
  return await repository.reject(id);
}
