'use client';

import { Input } from "@/components/ui/input";
import { useDriver } from "@/context/driver-context";

export function DriverSearch() {
  const { filter, search } = useDriver();

  return <Input
    placeholder="Search drivers"
    value={filter}
    onChange={(e) => search(e.target.value)}
    className="my-6 flex items-center max-w-md ms-auto"
  />
}
