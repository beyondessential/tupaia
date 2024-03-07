/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

export class SurveyResponseCommentRecord extends DatabaseType {
  static databaseType = TYPES.SURVEY_RESPONSE_COMMENT;
}

export class SurveyResponseCommentModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return SurveyResponseCommentRecord;
  }
}
