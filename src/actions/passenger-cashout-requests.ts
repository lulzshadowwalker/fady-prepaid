"use server";

import { passengerCashoutRequestRepository } from "@/lib/container";
import { PassengerCashoutRequest} from "@/lib/types";

const repository = passengerCashoutRequestRepository();

export async function getCashoutRequests(): Promise<PassengerCashoutRequest[]> {
  return await repository.getAll();
}

export async function approveCashoutRequest(id: string, actualAmount: number): Promise<void> {
  return await repository.approve(id, actualAmount);
}

export async function rejectCashoutRequest(id: string): Promise<void> {
  return await repository.reject(id);
}
