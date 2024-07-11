/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { ModelRegistry } from '@tupaia/database';
import {
  CountryModel,
  EntityModel,
  FeedItemModel,
  OneTimeLoginModel,
  OptionModel,
  PermissionGroupModel,
  SurveyModel,
  SurveyResponseModel,
  TaskModel,
  UserEntityPermissionModel,
  UserModel,
} from '@tupaia/server-boilerplate';

export interface DatatrakWebServerModelRegistry extends ModelRegistry {
  readonly user: UserModel;
  readonly entity: EntityModel;
  readonly country: CountryModel;
  readonly feedItem: FeedItemModel;
  readonly survey: SurveyModel;
  readonly surveyResponse: SurveyResponseModel;
  readonly oneTimeLogin: OneTimeLoginModel;
  readonly option: OptionModel;
  readonly task: TaskModel;
  readonly permissionGroup: PermissionGroupModel;
  readonly userEntityPermission: UserEntityPermissionModel;
}
