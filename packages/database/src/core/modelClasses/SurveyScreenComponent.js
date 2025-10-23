import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { buildSyncLookupSelect, buildSyncLookupTraverseJoins } from '../sync';

export class SurveyScreenComponentRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.SURVEY_SCREEN_COMPONENT;

  async question() {
    return await this.otherModels.question.findById(this.question_id);
  }

  async surveyScreen() {
    return await this.otherModels.surveyScreen.findById(this.screen_id);
  }

  async surveyId() {
    const surveyScreen = await this.surveyScreen();
    return surveyScreen.survey_id;
  }

  async survey() {
    return await this.otherModels.survey.findById(await this.surveyId());
  }
}

export class SurveyScreenComponentModel extends DatabaseModel {
  static syncDirection = SyncDirections.PULL_FROM_CENTRAL;

  /**
   * @param {import('@tupaia/types').SurveyScreenComponentConfig | undefined} config
   * @returns
   */
  static isUpsertEntityQuestion(config) {
    if (!config?.entity) return false;
    if (config.entity.createNew) return true;
    return config.entity.fields && Object.keys(config.entity.fields).length > 0;
  }

  get DatabaseRecordClass() {
    return SurveyScreenComponentRecord;
  }

  async buildSyncLookupQueryDetails() {
    return {
      select: await buildSyncLookupSelect(this, {
        projectIds: 'array_remove(ARRAY[survey.project_id], NULL)',
      }),
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
