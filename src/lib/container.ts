import "reflect-metadata";

import { container } from "tsyringe";
import { InMemoryPrepaidCardTemplateRepository } from "./repositories/InMemoryPrepaidCardTemplateRepository";
import { PrepaidCardTemplateRepository } from "./contracts/prepaid-card-template-repository";

const PREPAID_CARD_TEMPLATE_REPOSITORY = "PREPAID_CARD_TEMPLATE_REPOSITORY";

container.register<PrepaidCardTemplateRepository>(PREPAID_CARD_TEMPLATE_REPOSITORY, {
  useClass: InMemoryPrepaidCardTemplateRepository,
});

export const prepaidCardTemplateRepository = () => container.resolve<PrepaidCardTemplateRepository>(PREPAID_CARD_TEMPLATE_REPOSITORY);

