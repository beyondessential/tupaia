import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { buildSyncLookupSurveyProjectIdSelect, buildSyncLookupTraverseJoins } from '../sync';

export class SurveyScreenRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.SURVEY_SCREEN;
}

export class SurveyScreenModel extends DatabaseModel {
  syncDirection = SyncDirections.BIDIRECTIONAL;

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
