'use server';

import { prepaidCardTemplateRepository } from '@/lib/container';
import { CreatePrepaidCardTemplateParams } from '@/lib/contracts/prepaid-card-template-repository';
import { PrepaidCardTemplate } from '@/lib/types';

const repository = prepaidCardTemplateRepository();

export async function getPrepaidCardTemplates(): Promise<PrepaidCardTemplate[]> {
  return await repository.getAll();
}

export async function createPrepaidCardTemplate(
  template: CreatePrepaidCardTemplateParams
): Promise<PrepaidCardTemplate> {
  return await repository.create(template);
}

export async function activatePrepaidCardTemplate(template: PrepaidCardTemplate): Promise<PrepaidCardTemplate> {
  return await repository.update(template, { status: 'active' });
}

export async function deactivatePrepaidCardTemplate(template: PrepaidCardTemplate): Promise<PrepaidCardTemplate> {
  return await repository.update(template, { status: 'inactive' });
}
