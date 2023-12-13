/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { ModelRegistry, EntityModel, EntityType as BaseEntityType } from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';
import { Entity } from '@tupaia/types';
import { FeedItemModel, SurveyResponseModel } from './models';

export type EntityType = BaseEntityType & Entity;

export interface DatatrakWebServerModelRegistry extends ModelRegistry {
  readonly entity: Model<EntityModel, Entity, EntityType>;
  readonly surveyResponse: SurveyResponseModel;
  readonly feedItem: FeedItemModel;
}
