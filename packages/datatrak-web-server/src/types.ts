/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import {
  ModelRegistry,
  UserModel,
  EntityModel,
  EntityType as BaseEntityType,
  UserType as BaseUserType,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';
import { Entity, UserAccount } from '@tupaia/types';
import { FeedItemModel, SurveyResponseModel } from './models';

export type EntityType = BaseEntityType & Entity;

export type UserType = BaseUserType & UserAccount;

export interface DatatrakWebServerModelRegistry extends ModelRegistry {
  readonly entity: Model<EntityModel, Entity, EntityType>;
  readonly surveyResponse: SurveyResponseModel;
  readonly feedItem: FeedItemModel;
  readonly user: Model<UserModel, UserAccount, UserType>;
}
