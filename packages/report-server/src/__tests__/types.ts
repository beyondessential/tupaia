import { Knex } from 'knex';

import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';

export interface TestModelRegistry extends Omit<ModelRegistry, '#private'> {
  readonly database: TupaiaDatabase;

  wrapInTransaction<T = unknown>(
    wrappedFunction: (models: TestModelRegistry) => Promise<T>,
    transactionConfig?: Knex.TransactionConfig,
  ): Promise<T>;
  wrapInReadOnlyTransaction<T = unknown>(
    wrappedFunction: (models: TestModelRegistry) => Promise<T>,
    transactionConfig?: Omit<Knex.TransactionConfig, 'readOnly'>,
  ): Promise<T>;
  wrapInRepeatableReadTransaction<T = unknown>(
    wrappedFunction: (models: TestModelRegistry) => Promise<T>,
    transactionConfig?: Omit<Knex.TransactionConfig, 'isolationLevel'>,
  ): Promise<T>;
}
