import { AccessPolicy, hasBESAdminAccess } from '@tupaia/access-policy';
import { SyncDirections } from '@tupaia/constants';
import { reduceToDictionary } from '@tupaia/utils';
import { ensure } from '@tupaia/tsutils';
import { QuestionType } from '@tupaia/types';

import { MaterializedViewLogDatabaseModel } from '../../analytics';
import { QUERY_CONJUNCTIONS } from '../../BaseDatabase';
import { DatabaseRecord } from '../../DatabaseRecord';
import { RECORDS } from '../../records';
import { SqlQuery } from '../../SqlQuery';
import { buildSyncLookupSelect } from '../../sync';
import { OptionRecord } from '../Option';
import { findQuestionsInSurvey } from './findQuestionsInSurvey';

export class SurveyRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.SURVEY;

  /**
   * @returns {Promise<import('../DataGroup').DataGroupRecord>} data group for survey
   */
  async dataGroup() {
    return await this.otherModels.dataGroup.findById(this.data_group_id);
  }

  /**
   * @returns {Promise<import('../SurveyScreen').SurveyScreenRecord[]>} survey screens in survey
   */
  async surveyScreens() {
    return await this.otherModels.surveyScreen.find({ survey_id: this.id });
  }

  /**
   * @returns {Promise<import('../SurveyScreenComponent').SurveyScreenComponentRecord[]>} survey screen components in survey
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

    return await Promise.all(
      questions.map(this.otherModels.surveyScreenComponent.generateInstance),
    );
  }

  /**
   * @returns {Promise<import('../Question').QuestionRecord[]>} questions in survey
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
   * @returns {Promise<import('../OptionSet').OptionSetRecord[]>} optionSets in questions in survey
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

    return await Promise.all(optionSets.map(this.otherModels.optionSet.generateInstance));
  }

  /**
   * @returns {Promise<import('../Option').OptionRecord[]>} options in optionSets in questions in survey
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

    return await Promise.all(options.map(this.otherModels.option.generateInstance));
  }

  /**
   * @returns {Promise<import('../PermissionGroup').PermissionGroupRecord>} permission group for survey
   */
  async getPermissionGroup() {
    return await this.otherModels.permissionGroup.findById(this.permission_group_id);
  }

  /**
   * @returns {Promise<import('../Country').CountryRecord[]>} countries that use this survey
   */
  async getCountries() {
    return await this.otherModels.country.findManyById(this.country_ids);
  }

  /**
   * @returns {Promise<string[]>} country codes of countries that use this survey
   */
  async getCountryCodes() {
    const countries = await this.getCountries();
    return countries.map(c => c.code);
  }

  /**
   * @returns {Promise<import('../Project').ProjectRecord>}
   */
  async getProject() {
    return ensure(
      await this.otherModels.project.findById(this.project_id),
      `Couldn’t find project for survey ${this.code} (expected project with ID ${this.project_id})`,
    );
  }

  async hasResponses() {
    const count = await this.otherModels.surveyResponse.count({ survey_id: this.id });
    return count > 0;
  }

  async getPaginatedQuestions() {
    function formatSurveyScreenComponent(ssc) {
      const {
        config,
        question,
        validation_criteria,
        visibility_criteria,
        detail_label = question.detail, // Screen component can override the question detail
        question_text = question.text, // Screen component can override the question text
        ...rest
      } = ssc;

      return {
        ...rest,
        ...question, // include component and question fields in one object
        component_id: ssc.id,
        config: config ? JSON.parse(config) : null,
        detail_label,
        options: question.options.map(OptionRecord.parseForClient),
        question_id: question.id,
        text: question_text,
        validation_criteria: validation_criteria ? JSON.parse(validation_criteria) : null,
        visibility_criteria: visibility_criteria ? JSON.parse(visibility_criteria) : null,
      };
    }

    const questions = await this.getQuestionsValues();
    const formatted = questions
      // Hide Task questions in UI. They’re used to trigger task creation by TaskCreationHandler.
      .filter(question => question.type !== QuestionType.Task)
      .map(screen => ({
        ...screen,
        survey_screen_components: screen.survey_screen_components
          .map(formatSurveyScreenComponent)
          .sort((a, b) => a.component_number - b.component_number),
      }))
      .sort((a, b) => a.screen_number - b.screen_number);

    return formatted;
  }

  async getQuestionsValues() {
    const dictionary = await this.model.getQuestionsValues([this.id]);
    return dictionary[this.id] ?? [];
  }
}

export class SurveyModel extends MaterializedViewLogDatabaseModel {
  static syncDirection = SyncDirections.PULL_FROM_CENTRAL;

  static async findQuestionsInSurvey(models, surveyId) {
    return await findQuestionsInSurvey(models, surveyId);
  }

  get DatabaseRecordClass() {
    return SurveyRecord;
  }

  async createAccessPolicyQueryClause(accessPolicy) {
    const countryIdsByPermissionGroup = await this.getCountryIdsByPermissionGroup(accessPolicy);
    const params = Object.entries(countryIdsByPermissionGroup).flat(2); // e.g. ['Public', 'id1', 'id2', 'Admin', 'id3']

    return {
      sql: `(${Object.entries(countryIdsByPermissionGroup)
        .map(([, countryIds]) => {
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

      result[permissionGroupId] = countryIds;
      return result;
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

  /**
   * @param {SurveyRecord['id'][]} surveyIds
   * @returns {Promise<Record<SurveyRecord['id'], import('../Country').CountryRecord['id'][]>>}
   * Dictionary mapping survey IDs to sorted arrays of country codes
   */
  async getCountryCodesBySurveyId(surveyIds) {
    if (surveyIds.length === 0) return {};

    const rows = await this.database.executeSql(
      `
        SELECT
          survey.id survey_id,
          ARRAY_AGG(country.code ORDER BY country.code) AS country_codes
        FROM
          survey
          LEFT JOIN country ON country.id = ANY (survey.country_ids)
        WHERE
          survey.id IN ${SqlQuery.record(surveyIds)}
        GROUP BY
          survey.id;
      `,
      surveyIds,
    );
    return Object.fromEntries(rows.map(row => [row.survey_id, row.country_codes]));
  }

  /**
   * @param {SurveyRecord['id'][]} surveyIds
   * @returns {Promise<Record<SurveyRecord['id'], import('../Country').CountryRecord['id'][]>>}
   * Dictionary mapping survey IDs to sorted arrays of country names
   */
  async getCountryNamesBySurveyId(surveyIds) {
    if (surveyIds.length === 0) return {};

    const rows = await this.database.executeSql(
      `
        SELECT
          survey.id survey_id,
          ARRAY_AGG(country.name ORDER BY country.name) country_names
        FROM
          survey
          LEFT JOIN country ON country.id = ANY (survey.country_ids)
        WHERE
          survey.id IN ${SqlQuery.record(surveyIds)} GROUP BY survey.id;
      `,
      surveyIds,
    );
    return Object.fromEntries(rows.map(row => [row.survey_id, row.country_names]));
  }

  /**
   * @param {SurveyRecord['id'][]} surveyIds
   * @returns {Promise<Record<SurveyRecord['id'], import('../SurveyGroup').SurveyGroupRecord['name']>>}
   * Dictionary mapping survey IDs to sorted arrays of country names
   */
  async getSurveyGroupNamesBySurveyId(surveyIds) {
    if (surveyIds.length === 0) return {};

    const rows = await this.database.executeSql(
      `
        SELECT
          survey.id AS survey_id,
          survey_group.name AS survey_group_name
        FROM
          survey
          LEFT JOIN survey_group ON survey.survey_group_id = survey_group.id
        WHERE
          survey.id IN ${SqlQuery.record(surveyIds)}
      `,
      surveyIds,
    );
    return Object.fromEntries(rows.map(row => [row.survey_id, row.survey_group_name]));
  }

  /** @see `./README.md` */
  async getQuestionsValues(surveyIds) {
    if (surveyIds.length === 0) return {};

    const rows = await this.database.executeSql(
      `
        SELECT
          s.id AS survey_id,
          ss.id AS survey_screen_id,
          ss.screen_number AS screen_number,
          ssc.id AS survey_screen_component_id,
          ssc.component_number AS component_number,
          ssc.visibility_criteria AS visibility_criteria,
          ssc.validation_criteria AS validation_criteria,
          ssc.config AS config,
          ssc.question_label AS question_label,
          q.id AS question_id,
          q.name AS question_name,
          q.type AS question_type,
          q.code AS question_code,
          q.text AS question_text,
          q.options AS question_options,
          q.option_set_id AS question_option_set_id,
          q.detail AS question_detail
        FROM
          survey s
          LEFT JOIN survey_screen ss ON s.id = ss.survey_id
          LEFT JOIN survey_screen_component ssc ON ss.id = ssc.screen_id
          LEFT JOIN question q ON ssc.question_id = q.id
        WHERE
          s.id IN ${SqlQuery.record(surveyIds)}
        GROUP BY
          s.id, ssc.id, ss.id, q.id;
      `,
      surveyIds,
    );
    return this.getAggregatedQuestions(rows);
  }

  async buildSyncLookupQueryDetails() {
    return {
      select: await buildSyncLookupSelect(this, {
        projectIds: 'array_remove(ARRAY[survey.project_id], NULL)',
      }),
    };
  }

  async createRecordsPermissionFilter(accessPolicy, criteria = {}) {
    if (hasBESAdminAccess(accessPolicy)) {
      return criteria;
    }
    const dbConditions = { ...criteria };

    const countryIdsByPermissionGroupId =
      await this.otherModels.permissionGroup.fetchCountryIdsByPermissionGroupId(accessPolicy);

    dbConditions[QUERY_CONJUNCTIONS.RAW] = {
      sql: `
        (
          survey.country_ids
          &&
          ARRAY(
            SELECT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->survey.permission_group_id)::TEXT)
          )
        )`,
      parameters: JSON.stringify(countryIdsByPermissionGroupId),
    };
    return dbConditions;
  }

  /**
   * @param {ReturnType<typeof this.getQuestionsValues>} rawResults
   */
  getAggregatedQuestions(rawResults) {
    const surveyQuestions = rawResults.reduce((questionsObject, currentResult) => {
      const { survey_id: id } = currentResult;
      const updatedValue = questionsObject;
      if (updatedValue[id]) return updatedValue;

      updatedValue[id] = [];
      return questionsObject;
    }, {});

    for (const result of rawResults) {
      const { survey_id, screen_number, survey_screen_id } = result;
      const screenIndex = surveyQuestions[survey_id].findIndex(
        screen => screen.id === survey_screen_id,
      );
      if (screenIndex !== -1) continue;
      surveyQuestions[survey_id].push({
        id: survey_screen_id,
        screen_number,
        survey_screen_components: [],
      });
    }

    for (const result of rawResults) {
      const {
        survey_id,
        survey_screen_id,
        survey_screen_component_id,
        component_number,
        visibility_criteria,
        validation_criteria,
        config,
        question_id,
        question_name,
        question_type,
        question_code,
        question_text,
        question_label,
        question_options,
        question_option_set_id,
        question_detail,
      } = result;

      const screenIndex = surveyQuestions[survey_id].findIndex(
        screen => screen.id === survey_screen_id,
      );

      surveyQuestions[survey_id][screenIndex].survey_screen_components.push({
        id: survey_screen_component_id,
        visibility_criteria,
        component_number,
        validation_criteria,
        config,
        question: {
          id: question_id,
          name: question_name,
          type: question_type,
          code: question_code,
          text: question_text,
          label: question_label,
          options: question_options,
          option_set_id: question_option_set_id,
          detail: question_detail,
        },
      });
    }

    return surveyQuestions;
  }
}
