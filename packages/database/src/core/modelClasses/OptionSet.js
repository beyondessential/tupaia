import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class OptionSetRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.OPTION_SET;

  async options() {
    const options = await this.otherModels.option.find({ option_set_id: this.id });
    return options.sort((a, b) => a.sort_order - b.sort_order);
  }

  async getSurveyIds() {
    const surveyScreens = await this.database.executeSql(
      `
       SELECT survey_screen.survey_id
       FROM survey_screen
       INNER JOIN survey_screen_component
         ON survey_screen_component.screen_id = survey_screen.id
       INNER JOIN question
         ON question.id = survey_screen_component.question_id
       WHERE question.option_set_id = ?
     `,
      this.id,
    );
    return surveyScreens.map(s => s.survey_id);
  }
}

export class OptionSetModel extends DatabaseModel {
  static syncDirection = SyncDirections.PULL_FROM_CENTRAL;

  get DatabaseRecordClass() {
    return OptionSetRecord;
  }

  async buildSyncLookupQueryDetails() {
    return null;
  }
}
