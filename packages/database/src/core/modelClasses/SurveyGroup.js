import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class SurveyGroupRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.SURVEY_GROUP;
}

export class SurveyGroupModel extends DatabaseModel {
  static syncDirection = SyncDirections.PULL_FROM_CENTRAL;

  get DatabaseRecordClass() {
    return SurveyGroupRecord;
  }

  async buildSyncLookupQueryDetails() {
    return null;
  }
}
