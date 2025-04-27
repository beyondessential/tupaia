import {
  buildSyncLookupSurveyProjectIdSelect,
  surveyScreenComponentToSurveyJoins,
} from '@tupaia/sync';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class SurveyScreenComponentRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.SURVEY_SCREEN_COMPONENT;

  async question() {
    return this.otherModels.question.findById(this.question_id);
  }

  async surveyScreen() {
    return this.otherModels.surveyScreen.findById(this.screen_id);
  }

  async surveyId() {
    const surveyScreen = await this.surveyScreen();
    return surveyScreen.survey_id;
  }

  async survey() {
    return this.otherModels.survey.findById(await this.surveyId());
  }
}

export class SurveyScreenComponentModel extends DatabaseModel {
  syncDirection = SYNC_DIRECTIONS.BIDIRECTIONAL;

  get DatabaseRecordClass() {
    return SurveyScreenComponentRecord;
  }

  async buildSyncLookupQueryDetails() {
    return {
      select: await buildSyncLookupSurveyProjectIdSelect(),
      joins: surveyScreenComponentToSurveyJoins(),
    };
  }
}
