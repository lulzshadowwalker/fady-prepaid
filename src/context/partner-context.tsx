"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  getPartners,
  createPartner,
  updatePartner,
  deletePartner,
} from "@/actions/partners";
import { Partner } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

type State = {
  partners: Partner[];
};

type Actions = {
  create: (partner: Omit<Partner, "id">) => Promise<Partner | undefined>;
  update: (id: string, updated: Partial<Omit<Partner, "id">>) => Promise<Partner | undefined>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const PartnerContext = createContext<(State & Actions) | null>(null);

export function PartnerProvider({ children }: { children: React.ReactNode }) {
  const [partners, setPartners] = useState<Partner[]>([]);

  async function refresh() {
    const data = await getPartners();
    setPartners(data);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function create(partner: Omit<Partner, "id">): Promise<Partner | undefined> {
    try {
      const p = await createPartner(partner);
      setPartners((prev) => [...prev, p]);
      toast({ title: "Partner created successfully" });
      return p;
    } catch (e) {
      toast({ title: "Failed to create partner", variant: "destructive" });
      return undefined;
    }
  }

  async function update(id: string, updated: Partial<Omit<Partner, "id">>): Promise<Partner | undefined> {
    try {
      const p = await updatePartner(id, updated);
      setPartners((prev) =>
        prev.map((partner) => (partner.id === id ? p : partner))
      );
      toast({ title: "Partner updated successfully" });
      return p;
    } catch (e) {
      toast({ title: "Failed to update partner", variant: "destructive" });
      return undefined;
    }
  }

  async function remove(id: string): Promise<void> {
    try {
      await deletePartner(id);
      setPartners((prev) => prev.filter((partner) => partner.id !== id));
      toast({ title: "Partner deleted successfully" });
    } catch (e) {
      toast({ title: "Failed to delete partner", variant: "destructive" });
    }
  }

  return (
    <PartnerContext.Provider value={{ partners, create, update, remove, refresh }}>
      {children}
    </PartnerContext.Provider>
  );
}

export function usePartner(): State & Actions {
  const context = useContext(PartnerContext);

  if (!context) {
    throw new Error("usePartner must be used within a PartnerProvider");
  }

  return context;
}
