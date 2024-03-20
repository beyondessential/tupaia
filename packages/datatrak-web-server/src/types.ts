/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import {
  ModelRegistry,
  EntityModel,
  EntityRecord as BaseEntityRecord,
  SurveyModel,
  OneTimeLoginModel,
  OneTimeLoginRecord as BaseOneTimeLoginRecord,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';
import { Entity, OneTimeLogin } from '@tupaia/types';
import { FeedItemModel, SurveyResponseModel, UserModel } from './models';
import { OptionModel } from '@tupaia/database';

export type EntityRecord = BaseEntityRecord & Entity;
export type OneTimeLoginRecord = BaseOneTimeLoginRecord & OneTimeLogin;

export interface DatatrakWebServerModelRegistry extends ModelRegistry {
  readonly entity: Model<EntityModel, Entity, EntityRecord>;
  readonly surveyResponse: SurveyResponseModel;
  readonly feedItem: FeedItemModel;
  readonly user: UserModel;
  readonly survey: SurveyModel;
  readonly oneTimeLogin: Model<OneTimeLoginModel, OneTimeLogin, OneTimeLoginRecord>;
  readonly option: OptionModel;
}
