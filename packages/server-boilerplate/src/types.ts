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
  EntityRecord,
  UserEntityPermissionRecord,
  PermissionGroupRecord,
  CountryModel,
  CountryRecord,
  SurveyModel,
  SurveyRecord,
} from '@tupaia/database';
import { UserEntityPermission, Entity, PermissionGroup, Country, Survey } from '@tupaia/types';
import { FeedItemModel, Model, UserModel, SurveyResponseModel } from './models';

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
    UserEntityPermissionRecord & UserEntityPermission
  >;
  readonly entity: Model<EntityModel, Entity, EntityRecord & Entity>;
  readonly permissionGroup: Model<
    PermissionGroupModel,
    PermissionGroup,
    PermissionGroupRecord & PermissionGroup
  >;
  readonly country: Model<CountryModel, Country, CountryRecord & Country>;
  readonly feedItem: FeedItemModel;
  readonly survey: Model<SurveyModel, Survey, SurveyRecord>;
  readonly surveyResponse: SurveyResponseModel;
}
