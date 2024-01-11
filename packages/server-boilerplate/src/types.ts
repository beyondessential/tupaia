/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  ModelRegistry,
  ApiRequestLogModel,
  APIClientModel,
  UserEntityPermissionModel,
  EntityModel,
  PermissionGroupModel,
  EntityType,
  UserEntityPermissionType,
  PermissionGroupType,
  CountryModel,
  CountryType,
} from '@tupaia/database';
import { UserEntityPermission, Entity, PermissionGroup, Country } from '@tupaia/types';
import { Model, UserModel } from './models';

export type AccessPolicyObject = Record<string, string[]>;

export type EmptyObject = Record<string, never>;

/**
 * @deprecated use @tupaia/api-client
 */
export type QueryParameters = Record<string, string>;

export type RequestBody = Record<string, unknown> | Record<string, unknown>[];

export interface ServerBoilerplateModelRegistry extends ModelRegistry {
  readonly apiRequestLog: ApiRequestLogModel;
  readonly apiClient: APIClientModel;
  readonly user: UserModel;
  readonly userEntityPermission: Model<
    UserEntityPermissionModel,
    UserEntityPermission,
    UserEntityPermissionType & UserEntityPermission
  >;
  readonly entity: Model<EntityModel, Entity, EntityType & Entity>;
  readonly permissionGroup: Model<
    PermissionGroupModel,
    PermissionGroup,
    PermissionGroupType & PermissionGroup
  >;
  readonly country: Model<CountryModel, Country, CountryType & Country>;
}
