/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class SurveyResponseCommentRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.SURVEY_RESPONSE_COMMENT;
}

export class SurveyResponseCommentModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return SurveyResponseCommentRecord;
  }
}
