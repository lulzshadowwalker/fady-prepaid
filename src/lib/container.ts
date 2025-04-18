import "reflect-metadata";

import { container } from "tsyringe";
import { InMemoryPrepaidCardTemplateRepository } from "@/lib/repositories/InMemoryPrepaidCardTemplateRepository";
import { PrepaidCardTemplateRepository } from "@/lib/contracts/prepaid-card-template-repository";
import { FirebasePrepaidCardTemplateRepository } from "@/lib/repositories/FirebasePrepaidCardTemplateRepository";
import { PrepaidCardRepository } from "@/lib/contracts/prepaid-card-repository";
import { InMemoryPrepaidCardRepository } from "./repositories/InMemoryPrepaidCardRepository";
import { FirebasePrepaidCardRepository } from "./repositories/FirebasePrepaidCardRepository";

const PREPAID_CARD_TEMPLATE_REPOSITORY = "PREPAID_CARD_TEMPLATE_REPOSITORY";

container.register<PrepaidCardTemplateRepository>(
  PREPAID_CARD_TEMPLATE_REPOSITORY,
  {
    useClass: either(
      InMemoryPrepaidCardTemplateRepository,
      FirebasePrepaidCardTemplateRepository
    ),
  }
);

export const prepaidCardTemplateRepository = () =>
  container.resolve<PrepaidCardTemplateRepository>(
    PREPAID_CARD_TEMPLATE_REPOSITORY
  );

const PREPAID_CARD_REPOSITORY = "PREPAID_CARD_REPOSITORY";

container.register<PrepaidCardRepository>(PREPAID_CARD_REPOSITORY, {
  useClass: either(
    InMemoryPrepaidCardRepository,
    FirebasePrepaidCardRepository
  ),
});

export const prepaidCardRepository = () =>
  container.resolve<PrepaidCardRepository>(PREPAID_CARD_REPOSITORY);

/**
 * Returns the development or production value based on the current environment.
 *
 * @param dev - The value to use in a development environment.
 * @param prod - The value to use in a production environment.
 * @returns The value corresponding to the current environment.
 */
function either(dev: any, prod: any): any {
  const isDev = process.env.NODE_ENV === "development";

  return isDev ? dev : prod;
}
