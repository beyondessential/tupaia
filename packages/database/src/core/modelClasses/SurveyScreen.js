import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { buildSyncLookupSelect, buildSyncLookupTraverseJoins } from '../sync';

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
      select: await buildSyncLookupSelect(this, {
        projectIds: `ARRAY[survey.project_id]`,
      }),
      joins: buildSyncLookupTraverseJoins([this.databaseRecord, 'survey']),
    };
  }
}
