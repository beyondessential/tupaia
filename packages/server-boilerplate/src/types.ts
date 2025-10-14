import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';
import {
  ApiClientModel,
  ApiRequestLogModel,
  EntityModel,
  PermissionGroupModel,
  UserEntityPermissionModel,
  UserModel,
} from '@tupaia/tsmodels';
import { Knex } from 'knex';

export type AccessPolicyObject = Record<string, string[]>;

export type EmptyObject = Record<string, never>;

/**
 * @deprecated use @tupaia/api-client
 */
export type QueryParameters = Record<string, string>;

export type RequestBody = Record<string, unknown> | Record<string, unknown>[];

export interface ServerBoilerplateModelRegistry extends ModelRegistry {
  readonly database: TupaiaDatabase;

  readonly apiClient: ApiClientModel;
  readonly apiRequestLog: ApiRequestLogModel;
  readonly entity: EntityModel;
  readonly permissionGroup: PermissionGroupModel;
  readonly user: UserModel;
  readonly userEntityPermission: UserEntityPermissionModel;

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
    transactionConfig?: Omit<Knex.TransactionConfig, 'isolation'>,
  ): Promise<T>;
}
