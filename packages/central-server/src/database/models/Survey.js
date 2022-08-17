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

  async dataGroup() {
    return this.otherModels.dataGroup.findById(this.data_group_id);
  }

  async surveyScreens() {
    return this.otherModels.surveyScreen.find({ survey_id: this.id });
  }

  async surveyScreenComponents() {
    const questions = await this.database.executeSql(
      `
       SELECT ssc.* FROM survey_screen_component ssc
       JOIN survey_screen ss ON ss.id = ssc.screen_id
       WHERE ss.survey_id = ?
     `,
      [this.id],
    );

    return Promise.all(questions.map(this.otherModels.surveyScreenComponent.generateInstance));
  }

  async questions() {
    const questions = await this.database.executeSql(
      `
       SELECT q.* FROM question q
       JOIN survey_screen_component ssc ON ssc.question_id  = q.id
       JOIN survey_screen ss ON ss.id = ssc.screen_id
       WHERE ss.survey_id = ?
     `,
      [this.id],
    );

    return Promise.all(questions.map(this.otherModels.question.generateInstance));
  }

  async optionSets() {
    const optionSets = await this.database.executeSql(
      `
       SELECT os.* FROM option_set os
       JOIN question q on q.option_set_id = os.id
       JOIN survey_screen_component ssc ON ssc.question_id  = q.id
       JOIN survey_screen ss ON ss.id = ssc.screen_id
       WHERE ss.survey_id = ?
     `,
      [this.id],
    );

    return Promise.all(optionSets.map(this.otherModels.optionSet.generateInstance));
  }

  async options() {
    const options = await this.database.executeSql(
      `
       SELECT o.* FROM "option" o
       JOIN option_set os on o.option_set_id = os.id
       JOIN question q on q.option_set_id = os.id
       JOIN survey_screen_component ssc ON ssc.question_id  = q.id
       JOIN survey_screen ss ON ss.id = ssc.screen_id
       WHERE ss.survey_id = ?
     `,
      [this.id],
    );

    return Promise.all(options.map(this.otherModels.option.generateInstance));
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
  notifiers = [onChangeUpdateDataGroup];

  get DatabaseTypeClass() {
    return SurveyType;
  }

  meditrakConfig = {
    minAppVersion: '0.0.1',
  };
}

const onChangeUpdateDataGroup = async (
  { type: changeType, old_record: oldRecord, new_record: newRecord },
  models,
) => {
  switch (changeType) {
    case 'update': {
      const { code, data_group_id: dataGroupId } = newRecord;
      return models.dataGroup.updateById(dataGroupId, { code });
    }
    case 'delete': {
      const { data_group_id: dataGroupId } = oldRecord;
      return models.dataGroup.deleteById(dataGroupId);
    }
    default:
      throw new Error(`Non supported change type: ${changeType}`);
  }
};
