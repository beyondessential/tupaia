import { SyncDirections } from '@tupaia/constants';

import { MaterializedViewLogDatabaseModel } from '../analytics';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { buildSyncLookupSelect } from '../sync';

export class AnswerRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.ANSWER;
}

export class AnswerModel extends MaterializedViewLogDatabaseModel {
  static syncDirection = SyncDirections.BIDIRECTIONAL;

  async buildSyncLookupQueryDetails() {
    return {
      select: await buildSyncLookupSelect(this, {
        projectIds: `ARRAY[survey.project_id]`,
      }),
      joins: `
        LEFT JOIN survey_response ON survey_response.id = answer.survey_response_id
        LEFT JOIN survey ON survey.id = survey_response.survey_id
      `,
    };
  }

  get DatabaseRecordClass() {
    return AnswerRecord;
  }
}
