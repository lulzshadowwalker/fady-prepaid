import { PrepaidCardTemplate } from "@types";

export type CreatePrepaidCardTemplateParams = {
  name: string; 
  amount: string;
}

export interface PrepaidCardTemplateRepository {
  create(template: CreatePrepaidCardTemplateParams): Promise<PrepaidCardTemplate>;
  getAll(): Promise<PrepaidCardTemplate[]>;
}
