import { Knex } from 'knex';

import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';

export type AccessPolicyObject = Record<string, string[]>;

export type EmptyObject = Record<string, never>;

/**
 * @deprecated use @tupaia/api-client
 */
export type QueryParameters = Record<string, string>;

export type RequestBody = Record<string, unknown> | Record<string, unknown>[];

export interface ServerBoilerplateModelRegistry extends Omit<ModelRegistry, '#private'> {
  readonly database: TupaiaDatabase;

  wrapInTransaction<T = unknown>(
    wrappedFunction: (models: ServerBoilerplateModelRegistry) => Promise<T>,
    transactionConfig?: Knex.TransactionConfig,
  ): Promise<T>;
  wrapInReadOnlyTransaction<T = unknown>(
    wrappedFunction: (models: ServerBoilerplateModelRegistry) => Promise<T>,
    transactionConfig?: Omit<Knex.TransactionConfig, 'readOnly'>,
  ): Promise<T>;
  wrapInRepeatableReadTransaction<T = unknown>(
    wrappedFunction: (models: ServerBoilerplateModelRegistry) => Promise<T>,
    transactionConfig?: Omit<Knex.TransactionConfig, 'isolationLevel'>,
  ): Promise<T>;
}
