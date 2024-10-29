'use client';

import { prepaidCardRepository } from '@/lib/container';
import { CreatePreapidCardParams } from '@/lib/contracts/prepaid-card-repository';
import { InMemoryPrepaidCardRepository } from '@/lib/repositories/InMemoryPrepaidCardRepository';
import { PrepaidCard, PrepaidCardTemplate } from '@/lib/types';
import { createContext, useContext, useEffect, useState } from 'react';

type State = {};

type Actions = {
  createMany: (data: CreatePreapidCardParams) => Promise<PrepaidCard[]>;
};

const PrepaidCardContext = createContext<(State & Actions) | null>(null);

const repository = new InMemoryPrepaidCardRepository();

export function PrepaidCardProvider({ children }: { children: React.ReactNode }) {
  async function createMany(data: CreatePreapidCardParams): Promise<PrepaidCard[]> {
    return await repository.createMany(data);
  }

  return <PrepaidCardContext.Provider value={{ createMany }}>{children}</PrepaidCardContext.Provider>;
}

export function usePrepaidCard(): State & Actions {
  const context = useContext(PrepaidCardContext);

  if (!context) {
    throw new Error('usePrepaidCardTemplate must be used within a PrepaidCardTemplateProvider');
  }

  return context;
}
