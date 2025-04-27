import {
  buildSyncLookupSurveyProjectIdSelect,
  buildSyncLookupTraverseJoins,
  surveyScreenComponentToSurveyJoins,
} from '@tupaia/sync';

import { MaterializedViewLogDatabaseModel } from '../analytics';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class QuestionRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.QUESTION;
}

export class QuestionModel extends MaterializedViewLogDatabaseModel {
  syncDirection = SYNC_DIRECTIONS.BIDIRECTIONAL;

  get DatabaseRecordClass() {
    return QuestionRecord;
  }

  async buildSyncLookupQueryDetails() {
    return {
      select: await buildSyncLookupSurveyProjectIdSelect(),
      joins: `
        ${buildSyncLookupTraverseJoins([this.databaseRecord, 'survey_screen_component'])}
        ${surveyScreenComponentToSurveyJoins()}
      `,
    };
  }
}
