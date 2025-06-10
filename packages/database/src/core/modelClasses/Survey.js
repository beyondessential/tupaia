import { reduceToDictionary } from '@tupaia/utils';
import { AccessPolicy } from '@tupaia/access-policy';
import { SyncDirections } from '@tupaia/constants';

import { MaterializedViewLogDatabaseModel } from '../analytics';
import { DatabaseRecord } from '../DatabaseRecord';
import { QUERY_CONJUNCTIONS } from '../BaseDatabase';
import { RECORDS } from '../records';
import { SqlQuery } from '../SqlQuery';
import { buildSyncLookupSelect } from '../sync';

export class SurveyRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.SURVEY;

  /**
   * @returns {Promise<import('./DataGroup').DataGroupRecord>} data group for survey
   */
  async dataGroup() {
    return this.otherModels.dataGroup.findById(this.data_group_id);
  }

  /**
   * @returns {Promise<import('./SurveyScreen').SurveyScreenRecord[]>} survey screens in survey
   */
  async surveyScreens() {
    return this.otherModels.surveyScreen.find({ survey_id: this.id });
  }

  /**
   * @returns {Promise<import('./SurveyScreenComponent').SurveyScreenComponentRecord[]>} survey screen components in survey
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
   * @returns {Promise<import('./Question').QuestionRecord[]>} questions in survey
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
   * @returns {Promise<import('./OptionSet').OptionSetRecord[]>} optionSets in questions in survey
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
   * @returns {Promise<import('./Option').OptionRecord[]>} options in optionSets in questions in survey
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
   * @returns {Promise<import('./PermissionGroup').PermissionGroupRecord>} permission group for survey
   */
  async getPermissionGroup() {
    return this.otherModels.permissionGroup.findById(this.permission_group_id);
  }

  /**
   * @returns {Promise<import('./Country').CountryRecord[]>} countries that use this survey
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
  syncDirection = SyncDirections.BIDIRECTIONAL;

  get DatabaseRecordClass() {
    return SurveyRecord;
  }

  async createAccessPolicyQueryClause(accessPolicy) {
    const countryIdsByPermissionGroup = await this.getCountryIdsByPermissionGroup(accessPolicy);
    const params = Object.entries(countryIdsByPermissionGroup).flat().flat(); // e.g. ['Public', 'id1', 'id2', 'Admin', 'id3']

    return {
      sql: `(${Object.entries(countryIdsByPermissionGroup)
        .map(([_, countryIds]) => {
          return `
          (
            permission_group_id = ? AND 
            ${SqlQuery.array(countryIds, 'TEXT')} && country_ids
          )
        `;
        })
        .join(' OR ')})`,
      parameters: params,
    };
  }

  async getCountryIdsByPermissionGroup(accessPolicy) {
    const permissionGroupNames = accessPolicy.getPermissionGroups();

    const countries = await this.otherModels.country.find({});

    const permissionGroups = await this.otherModels.permissionGroup.find({
      name: permissionGroupNames,
    });

    const countryIdByCode = reduceToDictionary(countries, 'code', 'id');

    const permissionGroupIdByName = reduceToDictionary(permissionGroups, 'name', 'id');
    return permissionGroupNames.reduce((result, permissionGroupName) => {
      const countryCodes = accessPolicy.getEntitiesAllowed(permissionGroupName);
      const permissionGroupId = permissionGroupIdByName[permissionGroupName];
      const countryIds = countryCodes.map(code => countryIdByCode[code]);
      return {
        ...result,
        [permissionGroupId]: countryIds,
      };
    }, {});
  }

  /**
   *
   * @param {AccessPolicy} accessPolicy
   * @param {*} dbConditions
   * @param {*} customQueryOptions
   * @returns
   */
  async findByAccessPolicy(accessPolicy, dbConditions = {}, customQueryOptions) {
    const queryClause = await this.createAccessPolicyQueryClause(accessPolicy);

    const queryConditions = {
      [QUERY_CONJUNCTIONS.RAW]: queryClause,
      ...dbConditions,
    };

    const surveys = await this.find(queryConditions, customQueryOptions);

    return surveys;
  }

  async buildSyncLookupQueryDetails() {
    return {
      select: await buildSyncLookupSelect(this, {
        projectIds: `ARRAY[survey.project_id]`,
      }),
    };
  }
}
