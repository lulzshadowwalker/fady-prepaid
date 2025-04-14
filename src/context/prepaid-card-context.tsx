"use client";

import { getPrepaidCardTemplates } from "@/actions/prepaid-card-templates";
import {
  createManyPrepaidCards,
  getBatches,
  getPrepaidCards,
} from "@/actions/prepaid-cards";
import { CreatePreapidCardParams } from "@/lib/contracts/prepaid-card-repository";
import { Batch, PrepaidCard } from "@/lib/types";
import { createContext, useContext, useEffect, useState } from "react";

type State = {
  cards: PrepaidCard[];
  batches: Batch[];
};

type Actions = {
  createMany: (data: CreatePreapidCardParams) => Promise<PrepaidCard[]>;
};

const PrepaidCardContext = createContext<(State & Actions) | null>(null);

export function PrepaidCardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cards, setCards] = useState<PrepaidCard[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  useEffect(() => {
    getPrepaidCards().then(setCards);
  }, []);

  useEffect(() => {
    getBatches().then(setBatches);
  }, []);

  async function createMany(
    data: CreatePreapidCardParams
  ): Promise<PrepaidCard[]> {
    return await createManyPrepaidCards(data);
  }

  return (
    <PrepaidCardContext.Provider value={{ createMany, cards, batches }}>
      {children}
    </PrepaidCardContext.Provider>
  );
}

export function usePrepaidCard(): State & Actions {
  const context = useContext(PrepaidCardContext);

  if (!context) {
    throw new Error("usePrepaidCard must be used within a PrepaidCardProvider");
  }

  return context;
}
