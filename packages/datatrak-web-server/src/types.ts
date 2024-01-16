/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { ModelRegistry, EntityModel, EntityType as BaseEntityType, OneTimeLoginModel, OneTimeLoginType as BaseOneTimeLoginType } from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';
import { Entity, OneTimeLogin } from '@tupaia/types';
import { FeedItemModel, SurveyResponseModel } from './models';

export type EntityType = BaseEntityType & Entity;
export type OneTimeLoginType = BaseOneTimeLoginType & OneTimeLogin;

export interface DatatrakWebServerModelRegistry extends ModelRegistry {
  readonly entity: Model<EntityModel, Entity, EntityType>;
  readonly surveyResponse: SurveyResponseModel;
  readonly feedItem: FeedItemModel;
  readonly oneTimeLogin: Model<OneTimeLoginModel, OneTimeLogin, OneTimeLoginType>;
}
