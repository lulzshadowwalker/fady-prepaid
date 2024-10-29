import 'reflect-metadata';

import { container } from 'tsyringe';
import { InMemoryPrepaidCardTemplateRepository } from '@/lib/repositories/InMemoryPrepaidCardTemplateRepository';
import { PrepaidCardTemplateRepository } from '@/lib/contracts/prepaid-card-template-repository';
import { FirebasePrepaidCardTemplateRepository } from '@/lib/repositories/FirebasePrepaidCardTemplateRepository';
import { PrepaidCardRepository } from '@/lib/contracts/prepaid-card-repository';
import { InMemoryPrepaidCardRepository } from './repositories/InMemoryPrepaidCardRepository';
import { FirebasePrepaidCardRepository } from './repositories/FirebasePrepaidCardRepository';

const PREPAID_CARD_TEMPLATE_REPOSITORY = 'PREPAID_CARD_TEMPLATE_REPOSITORY';

container.register<PrepaidCardTemplateRepository>(PREPAID_CARD_TEMPLATE_REPOSITORY, {
  // useClass: InMemoryPrepaidCardTemplateRepository,
  useClass: FirebasePrepaidCardTemplateRepository,
});

export const prepaidCardTemplateRepository = () =>
  container.resolve<PrepaidCardTemplateRepository>(PREPAID_CARD_TEMPLATE_REPOSITORY);

const PREPAID_CARD_REPOSITORY = 'PREPAID_CARD_REPOSITORY';

container.register<PrepaidCardRepository>(PREPAID_CARD_REPOSITORY, {
  // useClass: InMemoryPrepaidCardRepository,
  useClass: FirebasePrepaidCardRepository,
});

export const prepaidCardRepository = () => container.resolve<PrepaidCardRepository>(PREPAID_CARD_REPOSITORY);
