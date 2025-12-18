import { Knex } from 'knex';

import {
  ModelRegistry,
  PermissionGroupModel,
  ReportModel,
  TupaiaDatabase,
  UserModel,
} from '@tupaia/database';

export interface TestModelRegistry extends ModelRegistry {
  readonly database: TupaiaDatabase;

  readonly user: UserModel;
  readonly report: ReportModel;
  readonly permissionGroup: PermissionGroupModel;

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
