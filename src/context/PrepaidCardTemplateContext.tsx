"use client";

import { prepaidCardTemplateRepository } from "@/lib/container";
import { CreatePrepaidCardTemplateParams } from "@/lib/contracts/prepaid-card-template-repository";
import { PrepaidCardTemplate } from "@/lib/types";
import { createContext, useContext, useEffect, useState } from "react";

type State = {
  templates: PrepaidCardTemplate[];
}

type Actions = {
  create: (template: CreatePrepaidCardTemplateParams) => Promise<PrepaidCardTemplate>;
}

const PrepaidCardTemplateContext = createContext<State & Actions | null>(null);

const repository = prepaidCardTemplateRepository()

export function PrepaidCardTemplateProvider({ children }: { children: React.ReactNode }) {
  const [templates, setTemplates] = useState<PrepaidCardTemplate[]>([]);

  useEffect(() => {
    repository.getAll().then(setTemplates)
  }, []);

  async function create(template: CreatePrepaidCardTemplateParams): Promise<PrepaidCardTemplate> {
    const t = await repository.create(template);
    setTemplates((templates) => [...templates, t]);

    return t;
  }

  return <PrepaidCardTemplateContext.Provider value={{
    create,
    templates
  }}>
    {children}
  </ PrepaidCardTemplateContext.Provider>
}

export function usePrepaidCardTemplate(): State & Actions {
  const context = useContext(PrepaidCardTemplateContext);

  if (!context) {
    throw new Error('usePrepaidCardTemplate must be used within a PrepaidCardTemplateProvider');
  }

  return context;
} 
