import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class SurveyResponseCommentRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.SURVEY_RESPONSE_COMMENT;
}

export class SurveyResponseCommentModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return SurveyResponseCommentRecord;
  }
}
