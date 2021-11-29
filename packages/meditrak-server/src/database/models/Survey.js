/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { MaterializedViewLogDatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

class SurveyType extends DatabaseType {
  static databaseType = TYPES.SURVEY;

  static meditrakConfig = {
    minAppVersion: '0.0.1',
  };

  async event() {
    return this.otherModels.event.findById(this.event_id);
  }

  async questions() {
    const questions = await this.database.executeSql(
      `
       SELECT q.* FROM question q
       JOIN survey_screen_component ssc ON ssc.question_id  = q.id
       JOIN survey_screen ss ON ss.id = ssc.screen_id
       JOIN survey s ON s.id = ss.survey_id
       WHERE s.code = ?
     `,
      [this.code],
    );

    return Promise.all(questions.map(this.otherModels.question.generateInstance));
  }

  async getPermissionGroup() {
    return this.otherModels.permissionGroup.findById(this.permission_group_id);
  }

  async getCountries() {
    return this.otherModels.country.findManyById(this.country_ids);
  }

  async getCountryCodes() {
    const countries = await this.getCountries();
    return countries.map(c => c.code);
  }

  hasResponses = async () =>
    !!(await this.otherModels.surveyResponse.findOne({ survey_id: this.id }));
}

export class SurveyModel extends MaterializedViewLogDatabaseModel {
  notifiers = [onChangeUpdateEvent];

  get DatabaseTypeClass() {
    return SurveyType;
  }

  meditrakConfig = {
    minAppVersion: '0.0.1',
  };

  isDeletableViaApi = true;
}

const onChangeUpdateEvent = async (
  { type: changeType, old_record: oldRecord, new_record: newRecord },
  models,
) => {
  switch (changeType) {
    case 'update': {
      const { code, data_source_id: dataSourceId } = newRecord;
      return models.event.updateById(dataSourceId, { code });
    }
    case 'delete': {
      const { data_source_id: dataSourceId } = oldRecord;
      return models.event.deleteById(dataSourceId);
    }
    default:
      throw new Error(`Non supported change type: ${changeType}`);
  }
};
