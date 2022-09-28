/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { MaterializedViewLogDatabaseModel } from '../analytics';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

export class SurveyResponseType extends DatabaseType {
  static databaseType = TYPES.SURVEY_RESPONSE;
}

export class SurveyResponseModel extends MaterializedViewLogDatabaseModel {
  get DatabaseTypeClass() {
    return SurveyResponseType;
  }
}
