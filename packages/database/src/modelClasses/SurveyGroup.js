/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

class SurveyGroupRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.SURVEY_GROUP;
}

export class SurveyGroupModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return SurveyGroupRecord;
  }
}
