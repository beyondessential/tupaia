import {
  buildSyncLookupSurveyProjectIdSelect,
  buildSyncLookupTraverseJoins,
  SYNC_DIRECTIONS,
} from '@tupaia/sync';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
export class SurveyScreenRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.SURVEY_SCREEN;
}

export class SurveyScreenModel extends DatabaseModel {
  syncDirection = SYNC_DIRECTIONS.BIDIRECTIONAL;

  get DatabaseRecordClass() {
    return SurveyScreenRecord;
  }

  async buildSyncLookupQueryDetails() {
    return {
      select: await buildSyncLookupSurveyProjectIdSelect(this),
      joins: buildSyncLookupTraverseJoins([this.databaseRecord, 'survey']),
    };
  }
}
