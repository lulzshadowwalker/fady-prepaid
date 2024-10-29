'use client';

import {
  activatePrepaidCardTemplate,
  createPrepaidCardTemplate,
  deactivatePrepaidCardTemplate,
  getPrepaidCardTemplates,
} from '@/actions/prepaid-card-templates';
import { toast } from '@/hooks/use-toast';
import { CreatePrepaidCardTemplateParams } from '@/lib/contracts/prepaid-card-template-repository';
import { PrepaidCardTemplate } from '@/lib/types';
import { createContext, useContext, useEffect, useState } from 'react';

type State = {
  templates: PrepaidCardTemplate[];
};

type Actions = {
  create: (template: CreatePrepaidCardTemplateParams) => Promise<PrepaidCardTemplate>;
  activate: (template: PrepaidCardTemplate) => Promise<PrepaidCardTemplate>;
  deactivate: (template: PrepaidCardTemplate) => Promise<PrepaidCardTemplate>;
};

const PrepaidCardTemplateContext = createContext<(State & Actions) | null>(null);

export function PrepaidCardTemplateProvider({ children }: { children: React.ReactNode }) {
  const [templates, setTemplates] = useState<PrepaidCardTemplate[]>([]);

  useEffect(() => {
    getPrepaidCardTemplates().then(setTemplates);
  }, []);

  async function create(template: CreatePrepaidCardTemplateParams): Promise<PrepaidCardTemplate> {
    const t = await createPrepaidCardTemplate(template);
    setTemplates((templates) => [...templates, t]);

    return t;
  }

  async function activate(template: PrepaidCardTemplate): Promise<PrepaidCardTemplate> {
    try {
      const t = await activatePrepaidCardTemplate(template);

      setTemplates((templates) => templates.map((template) => (template.id === t.id ? t : template)));

      toast({ title: 'Template activated successfully' });

      return t;
    } catch (e) {
      toast({
        title: 'Failed to activate template',
        variant: 'destructive',
      });

      return template;
    }
  }

  async function deactivate(template: PrepaidCardTemplate): Promise<PrepaidCardTemplate> {
    try {
      const t = await deactivatePrepaidCardTemplate(template);

      setTemplates((templates) => templates.map((template) => (template.id === t.id ? t : template)));

      toast({ title: 'Template deactivated successfully' });

      return t;
    } catch (e) {
      toast({
        title: 'Failed to deactivate template',
        variant: 'destructive',
      });

      return template;
    }
  }

  return (
    <PrepaidCardTemplateContext.Provider
      value={{
        create,
        templates,
        activate,
        deactivate,
      }}
    >
      {children}
    </PrepaidCardTemplateContext.Provider>
  );
}

export function usePrepaidCardTemplate(): State & Actions {
  const context = useContext(PrepaidCardTemplateContext);

  if (!context) {
    throw new Error('usePrepaidCardTemplate must be used within a PrepaidCardTemplateProvider');
  }

  return context;
}
