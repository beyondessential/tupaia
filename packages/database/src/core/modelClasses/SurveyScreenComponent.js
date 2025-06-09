import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { buildSyncLookupSurveyProjectIdSelect, buildSyncLookupTraverseJoins } from '../sync';

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
  syncDirection = SyncDirections.BIDIRECTIONAL;

  get DatabaseRecordClass() {
    return SurveyScreenComponentRecord;
  }

  async buildSyncLookupQueryDetails() {
    return {
      select: await buildSyncLookupSurveyProjectIdSelect(this),
      joins: buildSyncLookupTraverseJoins([this.databaseRecord, 'survey_screen', 'survey'], {
        survey_screen_component_survey_screen: {
          fromTable: 'survey_screen_component',
          fromKey: 'screen_id',
          toTable: 'survey_screen',
          toKey: 'id',
        },
      }),
    };
  }
}
