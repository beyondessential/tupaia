import { buildSyncLookupSelect } from '@tupaia/sync';

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
      select: buildSyncLookupSelect(this, {
        projectIds: `ARRAY[survey.project_id]`,
      }),
      joins: buildSyncLookupTraverseJoins([this.databaseRecord, 'survey']),
    };
  }
}
