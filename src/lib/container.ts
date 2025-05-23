import "reflect-metadata";

import { container } from "tsyringe";
import { InMemoryPrepaidCardTemplateRepository } from "@/lib/repositories/InMemoryPrepaidCardTemplateRepository";
import { PrepaidCardTemplateRepository } from "@/lib/contracts/prepaid-card-template-repository";
import { FirebasePrepaidCardTemplateRepository } from "@/lib/repositories/FirebasePrepaidCardTemplateRepository";
import { PrepaidCardRepository } from "@/lib/contracts/prepaid-card-repository";
import { InMemoryPrepaidCardRepository } from "./repositories/InMemoryPrepaidCardRepository";
import { FirebasePrepaidCardRepository } from "./repositories/FirebasePrepaidCardRepository";
import { DriverRepository } from "./contracts/driver-repository";
import { InMemoryDriverRepository } from "./repositories/InMemoryDriverRepository";
import { FirebaseDriverRepository } from "./repositories/FirebaseDriverRepository";
import { CashoutRequestRepository } from "./contracts/cashout-request-repository";
import { InMemoryCashoutRequestRepository } from "./repositories/InMemoryCashoutRequestRepository";
import { PartnerRepository } from "./contracts/partner-repository";
import { InMemoryPartnerRepository } from "./repositories/InMemoryPartnerRepository";
import { FirebasePartnerRepository } from "./repositories/FirebasePartnerRepository";

const PREPAID_CARD_TEMPLATE_REPOSITORY = "PREPAID_CARD_TEMPLATE_REPOSITORY";

container.register<PrepaidCardTemplateRepository>(
  PREPAID_CARD_TEMPLATE_REPOSITORY,
  {
    useClass: either(
      InMemoryPrepaidCardTemplateRepository,
      FirebasePrepaidCardTemplateRepository,
    ),
  },
);

export const prepaidCardTemplateRepository = () =>
  container.resolve<PrepaidCardTemplateRepository>(
    PREPAID_CARD_TEMPLATE_REPOSITORY,
  );

const PREPAID_CARD_REPOSITORY = "PREPAID_CARD_REPOSITORY";

container.register<PrepaidCardRepository>(PREPAID_CARD_REPOSITORY, {
  useClass: either(
    InMemoryPrepaidCardRepository,
    FirebasePrepaidCardRepository,
  ),
});

export const prepaidCardRepository = () =>
  container.resolve<PrepaidCardRepository>(PREPAID_CARD_REPOSITORY);

const DRIVER_REPOSITORY = "DRIVER_REPOSITORY";

container.register<DriverRepository>(DRIVER_REPOSITORY, {
  useClass: either(InMemoryDriverRepository, FirebaseDriverRepository),
});

export const driverRepository = () =>
  container.resolve<DriverRepository>(DRIVER_REPOSITORY);

const CASHOUT_REQUEST_REPOSITORY = "CASHOUT_REQUEST_REPOSITORY";

container.register<CashoutRequestRepository>(CASHOUT_REQUEST_REPOSITORY, {
  useClass: either(
    InMemoryCashoutRequestRepository,
    InMemoryCashoutRequestRepository,
  ),
});

export const cashoutRequestRepository = () =>
  container.resolve<CashoutRequestRepository>(CASHOUT_REQUEST_REPOSITORY);

const PARTNER_REPOSITORY = "PARTNER_REPOSITORY";

container.register<PartnerRepository>(PARTNER_REPOSITORY, {
  useClass: either(InMemoryPartnerRepository, FirebasePartnerRepository),
});

export const partnerRepository = () =>
  container.resolve<PartnerRepository>(PARTNER_REPOSITORY);

/**
 * Returns the development or production value based on the current environment.
 *
 * @param dev - The value to use in a development environment.
 * @param prod - The value to use in a production environment.
 * @returns The value corresponding to the current environment.
 */
function either(dev: any, prod: any): any {
  const isDev = process.env.NODE_ENV === "development";

  return false ? dev : prod;
}
