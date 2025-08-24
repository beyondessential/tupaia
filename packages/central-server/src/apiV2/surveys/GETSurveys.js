/* eslint-disable camelcase */
import { JOIN_TYPES } from '@tupaia/database';
import { GETHandler } from '../GETHandler';
import {
  assertSurveyGetPermissions,
  createSurveyDBFilter,
  createSurveyViaCountryDBFilter,
} from './assertSurveyPermissions';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { processColumns } from '../GETHandler/helpers';

/**
 * See ./README.md
 *
 * Handles endpoints:
 * - /surveys
 * - /surveys/id
 * - /countries/id/surveys
 */

const SURVEY_QUESTIONS_COLUMN = 'surveyQuestions';
const COUNTRY_NAMES_COLUMN = 'countryNames';
const COUNTRY_CODES_COLUMN = 'countryCodes';

export class GETSurveys extends GETHandler {
  permissionsFilteredInternally = true;

  defaultJoinType = JOIN_TYPES.LEFT_OUTER;

  async findSingleRecord(surveyId, options) {
    const survey = await super.findSingleRecord(surveyId, options);

    const surveyChecker = accessPolicy =>
      assertSurveyGetPermissions(accessPolicy, this.models, surveyId);

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, surveyChecker]));

    // 1. Add surveyQuestions, see README
    const surveyQuestionsValues = await this.getSurveyQuestionsValues([surveyId]);

    // 2. Add countryNames
    const countryNames = await this.getSurveyCountryNames([surveyId]);
    const countryCodes = await this.getSurveyCountryCodes([surveyId]);

    return {
      ...survey,
      surveyQuestions: surveyQuestionsValues[surveyId],
      countryNames: countryNames[surveyId],
      countryCodes: countryCodes[surveyId],
    };
  }

  async findRecords(criteria, options) {
    const records = await super.findRecords(criteria, options);

    const recordIds = records.filter(record => record.id).map(record => record.id);
    const [surveyQuestionsValues, countryNames, countryCodes] = await Promise.all([
      this.getSurveyQuestionsValues(recordIds), // 1. Add surveyQuestions, see README
      this.getSurveyCountryNames(recordIds), // 2. Add countryNames
      this.getSurveyCountryCodes(recordIds), // 3. Add countryCodes
    ]);

    return records.map(record => ({
      ...record,
      surveyQuestions: surveyQuestionsValues[record.id],
      countryNames: countryNames[record.id],
      countryCodes: countryCodes[record.id],
    }));
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = await createSurveyDBFilter(this.accessPolicy, this.models, criteria);
    return { dbConditions, dbOptions: options };
  }

  async getPermissionsViaParentFilter(criteria, options) {
    const dbConditions = await createSurveyViaCountryDBFilter(
      this.accessPolicy,
      this.models,
      criteria,
      this.parentRecordId,
    );
    return { dbConditions, dbOptions: options };
  }

  async getProcessedColumns() {
    // We override this method to:
    // 1. strip out the "surveyQuestions" column, as we don't fetch it from the database. See README.md
    // 2. strip out the "countryNames" column, as the CRUD handler falls over with this
    const { columns: columnsString } = this.req.query;

    if (!columnsString) {
      // Always include these by default
      this.includeQuestions = true;
      this.includeCountryNames = true;
      return super.getProcessedColumns();
    }

    const parsedColumns = columnsString && JSON.parse(columnsString);
    // If we've requested specific columns, we allow skipping these fields by not requesting them
    this.includeQuestions = parsedColumns.includes(SURVEY_QUESTIONS_COLUMN);
    this.includeCountryNames = parsedColumns.includes(COUNTRY_NAMES_COLUMN);
    this.includeCountryCodes = parsedColumns.includes(COUNTRY_CODES_COLUMN);

    const unprocessedColumns = parsedColumns.filter(
      col => ![SURVEY_QUESTIONS_COLUMN, COUNTRY_NAMES_COLUMN, COUNTRY_CODES_COLUMN].includes(col),
    );
    return processColumns(this.models, unprocessedColumns, this.recordType);
  }

  async getSurveyQuestionsValues(surveyIds) {
    // See README.md
    if (surveyIds.length === 0 || !this.includeQuestions) return {};
    const rows = await this.database.executeSql(
      `
    SELECT
      s.id as survey_id,
      ss.id as survey_screen_id,
      ss.screen_number as screen_number,
      ssc.id as survey_screen_component_id,
      ssc.component_number as component_number,
      ssc.visibility_criteria as visibility_criteria,
      ssc.validation_criteria as validation_criteria,
      ssc.config as config,
      ssc.question_label as question_label,
      q.id as question_id,
      q.name as question_name,
      q.type as question_type,
      q.code as question_code,
      q.text as question_text,
      q.options as question_options,
      q.option_set_id as question_option_set_id,
      q.detail as question_detail
    FROM survey s
    LEFT JOIN survey_screen ss on s.id = ss.survey_id
    LEFT JOIN survey_screen_component ssc on ss.id = ssc.screen_id
    LEFT JOIN question q on ssc.question_id = q.id
    WHERE s.id in (${surveyIds.map(() => '?').join(',')})
    GROUP BY s.id, ssc.id, ss.id, q.id
    `,
      surveyIds,
    );

    const aggregatedQuestions = getAggregatedQuestions(rows);
    return aggregatedQuestions;
  }

  async getSurveyCountryNames(surveyIds) {
    if (surveyIds.length === 0 || !this.includeCountryNames) return {};
    const rows = await this.database.executeSql(
      `
    SELECT survey.id, array_agg(country.name) as country_names
    FROM survey
    LEFT JOIN country ON (country.id = any(survey.country_ids))
    WHERE survey.id in (${surveyIds.map(() => '?').join(',')})
    GROUP BY survey.id;
    `,
      surveyIds,
    );
    return Object.fromEntries(rows.map(row => [row.id, row.country_names]));
  }

  async getSurveyCountryCodes(surveyIds) {
    if (surveyIds.length === 0 || !this.includeCountryCodes) return {};
    const rows = await this.database.executeSql(
      `
    SELECT survey.id, array_agg(country.code) as country_codes
    FROM survey
    LEFT JOIN country ON (country.id = any(survey.country_ids))
    WHERE survey.id in (${surveyIds.map(() => '?').join(',')})
    GROUP BY survey.id;
    `,
      surveyIds,
    );
    return Object.fromEntries(rows.map(row => [row.id, row.country_codes.sort()]));
  }
}

const getAggregatedQuestions = rawResults => {
  const initialValue = {};
  const surveyQuestions = rawResults.reduce((questionsObject, currentResult) => {
    const { survey_id: id } = currentResult;
    const updatedValue = questionsObject;
    if (updatedValue[id]) {
      return updatedValue;
    }
    updatedValue[id] = [];
    return questionsObject;
  }, initialValue);

  for (let i = 0; i < rawResults.length; i++) {
    const { survey_id, screen_number, survey_screen_id } = rawResults[i];
    if (surveyQuestions[survey_id].map(screen => screen.id).includes(survey_screen_id)) {
      continue;
    }
    surveyQuestions[survey_id].push({
      id: survey_screen_id,
      screen_number,
      survey_screen_components: [],
    });
  }

  for (let i = 0; i < rawResults.length; i++) {
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
    } = rawResults[i];

    const screenIndex = surveyQuestions[survey_id]
      .map(screen => screen.id)
      .indexOf(survey_screen_id);

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
};
