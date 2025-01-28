import { ModelRegistry } from '@tupaia/database';
import {
  ApiClientModel,
  ApiRequestLogModel,
  EntityModel,
  PermissionGroupModel,
  UserEntityPermissionModel,
  UserModel,
} from './models';

export type AccessPolicyObject = Record<string, string[]>;

export type EmptyObject = Record<string, never>;

/**
 * @deprecated use @tupaia/api-client
 */
export type QueryParameters = Record<string, string>;

export type RequestBody = Record<string, unknown> | Record<string, unknown>[];

export interface ServerBoilerplateModelRegistry extends ModelRegistry {
  apiClient: ApiClientModel;
  apiRequestLog: ApiRequestLogModel;
  entity: EntityModel;
  permissionGroup: PermissionGroupModel;
  user: UserModel;
  userEntityPermission: UserEntityPermissionModel;
}
