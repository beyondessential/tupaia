/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { ModelRegistry, EntityModel } from '@tupaia/database';
import { SurveyScreenComponent } from '@tupaia/types';

export interface DatatrakWebServerModelRegistry extends ModelRegistry {
  readonly entity: EntityModel;

  readonly surveyScreenComponent: SurveyScreenComponent;
}
