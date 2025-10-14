import { Knex } from 'knex';

import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';
import {
  DataTableModel,
  EntityModel,
  ExternalDatabaseConnectionModel,
} from '@tupaia/server-boilerplate';

export interface DataTableServerModelRegistry extends ModelRegistry {
  readonly database: TupaiaDatabase;

  readonly dataTable: DataTableModel;
  readonly entity: EntityModel;
  readonly externalDatabaseConnection: ExternalDatabaseConnectionModel;

  wrapInTransaction<T = unknown>(
    wrappedFunction: (models: DataTableServerModelRegistry) => Promise<T>,
    transactionConfig?: Knex.TransactionConfig,
  ): Promise<T>;
  wrapInReadOnlyTransaction<T = unknown>(
    wrappedFunction: (models: DataTableServerModelRegistry) => Promise<T>,
    transactionConfig?: Omit<Knex.TransactionConfig, 'readOnly'>,
  ): Promise<T>;
  wrapInRepeatableReadTransaction<T = unknown>(
    wrappedFunction: (models: DataTableServerModelRegistry) => Promise<T>,
    transactionConfig?: Omit<Knex.TransactionConfig, 'isolationLevel'>,
  ): Promise<T>;
}
