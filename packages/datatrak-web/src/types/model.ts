import { Knex } from 'knex';

import { ModelRegistry } from '@tupaia/database';
import { DatatrakDatabase } from '../database/DatatrakDatabase';

export interface DatatrakWebModelRegistry extends Omit<ModelRegistry, '#private'> {
  readonly database: DatatrakDatabase;

  wrapInTransaction<T = unknown>(
    wrappedFunction: (models: DatatrakWebModelRegistry) => Promise<T>,
    transactionConfig?: Knex.TransactionConfig,
  ): Promise<T>;
  wrapInReadOnlyTransaction<T = unknown>(
    wrappedFunction: (models: DatatrakWebModelRegistry) => Promise<T>,
    transactionConfig?: Omit<Knex.TransactionConfig, 'readOnly'>,
  ): Promise<T>;
  wrapInRepeatableReadTransaction<T = unknown>(
    wrappedFunction: (models: DatatrakWebModelRegistry) => Promise<T>,
    transactionConfig?: Omit<Knex.TransactionConfig, 'isolationLevel'>,
  ): Promise<T>;
}
