import { Knex } from 'knex';

import { TupaiaApiClient } from '@tupaia/api-client';
import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';

export type RequestContext = {
  services: TupaiaApiClient;
};

export interface MeditrakAppServerModelRegistry extends Omit<ModelRegistry, '#private'> {
  readonly database: TupaiaDatabase;

  wrapInTransaction<T = unknown>(
    wrappedFunction: (models: MeditrakAppServerModelRegistry) => Promise<T>,
    transactionConfig?: Knex.TransactionConfig,
  ): Promise<T>;
  wrapInReadOnlyTransaction<T = unknown>(
    wrappedFunction: (models: MeditrakAppServerModelRegistry) => Promise<T>,
    transactionConfig?: Omit<Knex.TransactionConfig, 'readOnly'>,
  ): Promise<T>;
  wrapInRepeatableReadTransaction<T = unknown>(
    wrappedFunction: (models: MeditrakAppServerModelRegistry) => Promise<T>,
    transactionConfig?: Omit<Knex.TransactionConfig, 'isolationLevel'>,
  ): Promise<T>;
}
