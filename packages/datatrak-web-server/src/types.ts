/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { ModelRegistry } from '@tupaia/database';
import { EntityModel, FeedItemModel, SurveyResponseModel } from '@tupaia/server-boilerplate';

export interface DatatrakWebServerModelRegistry extends ModelRegistry {
  readonly entity: EntityModel;
  readonly surveyResponse: SurveyResponseModel;
  readonly feedItem: FeedItemModel;
}
