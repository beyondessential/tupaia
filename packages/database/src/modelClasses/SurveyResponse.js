/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class SurveyResponseType extends DatabaseType {
  static databaseType = TYPES.SURVEY_RESPONSE;
}

export class SurveyResponseModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return SurveyResponseType;
  }
}
