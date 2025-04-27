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
      select: buildSyncLookupSelect(this, {
        projectIds: `ARRAY[survey.project_id]`,
      }),
      joins: `
        LEFT JOIN survey ON survey.id = survey_screens.survey_id
        LEFT JOIN survey_screen ON survey_screen.id = survey_screen_component.survey_screen_id
      `,
    };
  }
}
