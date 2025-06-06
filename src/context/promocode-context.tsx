"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  listPromocodes,
  createPromocode,
  updatePromocode,
  deletePromocode,
} from "@/actions/promocodes";
import { Promocode } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

type State = {
  promocodes: Promocode[];
};

type Actions = {
  create: (
    promocode: Omit<Promocode, "id" | "createdAt" | "usageCount" | "usagePerUser">
  ) => Promise<Promocode | undefined>;
  update: (
    id: string,
    updated: Partial<Omit<Promocode, "id" | "createdAt" | "usageCount" | "usagePerUser">>
  ) => Promise<Promocode | undefined>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const PromocodeContext = createContext<(State & Actions) | null>(null);

export function PromocodeProvider({ children }: { children: React.ReactNode }) {
  const [promocodes, setPromocodes] = useState<Promocode[]>([]);

  async function refresh() {
    const data = await listPromocodes();
    setPromocodes(data);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function create(
    promocode: Omit<Promocode, "id" | "createdAt" | "usageCount" | "usagePerUser">
  ): Promise<Promocode | undefined> {
    try {
      const p = await createPromocode(promocode);
      setPromocodes((prev) => [...prev, p]);
      toast({ title: "Promocode created successfully" });
      return p;
    } catch (e) {
      toast({ title: "Failed to create promocode", variant: "destructive" });
      return undefined;
    }
  }

  async function update(
    id: string,
    updated: Partial<Omit<Promocode, "id" | "createdAt" | "usageCount" | "usagePerUser">>
  ): Promise<Promocode | undefined> {
    try {
      const p = await updatePromocode(id, updated);
      setPromocodes((prev) =>
        prev.map((promo) => (promo.id === id ? p : promo))
      );
      toast({ title: "Promocode updated successfully" });
      return p;
    } catch (e) {
      toast({ title: "Failed to update promocode", variant: "destructive" });
      return undefined;
    }
  }

  async function remove(id: string): Promise<void> {
    try {
      await deletePromocode(id);
      setPromocodes((prev) => prev.filter((promo) => promo.id !== id));
      toast({ title: "Promocode deleted successfully" });
    } catch (e) {
      toast({ title: "Failed to delete promocode", variant: "destructive" });
    }
  }

  return (
    <PromocodeContext.Provider value={{ promocodes, create, update, remove, refresh }}>
      {children}
    </PromocodeContext.Provider>
  );
}

export function usePromocode(): State & Actions {
  const context = useContext(PromocodeContext);

  if (!context) {
    throw new Error("usePromocode must be used within a PromocodeProvider");
  }

  return context;
}