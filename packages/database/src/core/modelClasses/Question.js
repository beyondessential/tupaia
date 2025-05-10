import {
  buildSyncLookupSurveyProjectIdSelect,
  buildSyncLookupTraverseJoins,
  surveyScreenComponentToSurveyJoins,
  SYNC_DIRECTIONS,
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
      select: await buildSyncLookupSurveyProjectIdSelect(this),
      joins: `
        LEFT JOIN survey_screen_component ON survey_screen_component.question_id = question.id
        LEFT JOIN survey_screen ON survey_screen.id = survey_screen_component.screen_id
        LEFT JOIN survey ON survey.id = survey_screen.survey_id
      `,
    };
  }
}
