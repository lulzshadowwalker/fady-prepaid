'use client';

import { createManyPrepaidCards } from '@/actions/prepaid-cards';
import { CreatePreapidCardParams } from '@/lib/contracts/prepaid-card-repository';
import { PrepaidCard } from '@/lib/types';
import { createContext, useContext } from 'react';

type State = {};

type Actions = {
  createMany: (data: CreatePreapidCardParams) => Promise<PrepaidCard[]>;
};

const PrepaidCardContext = createContext<(State & Actions) | null>(null);

export function PrepaidCardProvider({ children }: { children: React.ReactNode }) {
  async function createMany(data: CreatePreapidCardParams): Promise<PrepaidCard[]> {
    return await createManyPrepaidCards(data);
  }

  return <PrepaidCardContext.Provider value={{ createMany }}>{children}</PrepaidCardContext.Provider>;
}

export function usePrepaidCard(): State & Actions {
  const context = useContext(PrepaidCardContext);

  if (!context) {
    throw new Error('usePrepaidCard must be used within a PrepaidCardProvider');
  }

  return context;
}
