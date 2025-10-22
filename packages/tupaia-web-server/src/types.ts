import { Knex } from 'knex';

import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';

export interface TupaiaWebServerModelRegistry extends Omit<ModelRegistry, '#private'> {
  readonly database: TupaiaDatabase;

  wrapInTransaction<T = unknown>(
    wrappedFunction: (models: TupaiaWebServerModelRegistry) => Promise<T>,
    transactionConfig?: Knex.TransactionConfig,
  ): Promise<T>;
  wrapInReadOnlyTransaction<T = unknown>(
    wrappedFunction: (models: TupaiaWebServerModelRegistry) => Promise<T>,
    transactionConfig?: Omit<Knex.TransactionConfig, 'readOnly'>,
  ): Promise<T>;
  wrapInRepeatableReadTransaction<T = unknown>(
    wrappedFunction: (models: TupaiaWebServerModelRegistry) => Promise<T>,
    transactionConfig?: Omit<Knex.TransactionConfig, 'isolationLevel'>,
  ): Promise<T>;
}
