/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { MaterializedViewLogDatabaseModel } from '../analytics';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

export class SurveyType extends DatabaseType {
  static databaseType = TYPES.SURVEY;

  /**
   * @returns {Promise<import('./DataGroup').DataGroupType>} data group for survey
   */
  async dataGroup() {
    return this.otherModels.dataGroup.findById(this.data_group_id);
  }

  /**
   * @returns {Promise<import('./SurveyScreen').SurveyScreenType[]>} survey screens in survey
   */
  async surveyScreens() {
    return this.otherModels.surveyScreen.find({ survey_id: this.id });
  }

  /**
   * @returns {Promise<import('./SurveyScreenComponent').SurveyScreenComponentType[]>} survey screen components in survey
   */
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

  /**
   * @returns {Promise<import('./Question').QuestionType[]>} questions in survey
   */
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

  /**
   * @returns {Promise<import('./OptionSet').OptionSetType[]>} optionSets in questions in survey
   */
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

  /**
   * @returns {Promise<import('./Option').OptionType[]>} options in optionSets in questions in survey
   */
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

  /**
   * @returns {Promise<import('./PermissionGroup').PermissionGroupType>} permission group for survey
   */
  async getPermissionGroup() {
    return this.otherModels.permissionGroup.findById(this.permission_group_id);
  }

  /**
   * @returns {Promise<import('./Country').CountryType[]>} countries that use this survey
   */
  async getCountries() {
    return this.otherModels.country.findManyById(this.country_ids);
  }

  /**
   * @returns {Promise<string[]>} country codes of countries that use this survey
   */
  async getCountryCodes() {
    const countries = await this.getCountries();
    return countries.map(c => c.code);
  }

  hasResponses = async () =>
    !!(await this.otherModels.surveyResponse.findOne({ survey_id: this.id }));
}

export class SurveyModel extends MaterializedViewLogDatabaseModel {
  get DatabaseTypeClass() {
    return SurveyType;
  }
}
