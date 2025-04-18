"use server";

import { driverRepository } from "@/lib/container";
import { Driver } from "@/lib/types";

const repository = driverRepository();

export async function getDrivers(): Promise<Driver[]> {
  return await repository.getAll();
}
