/* eslint-disable camelcase */
import { JOIN_TYPES } from '@tupaia/database';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { GETHandler } from '../GETHandler';
import { processColumns } from '../GETHandler/helpers';
import {
  assertSurveyGetPermissions,
  createSurveyDBFilter,
  createSurveyViaCountryDBFilter,
} from './assertSurveyPermissions';

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
    const surveyChecker = accessPolicy =>
      assertSurveyGetPermissions(accessPolicy, this.models, surveyId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, surveyChecker]));

    const survey = await super.findSingleRecord(surveyId, options);
    const [surveyQuestionsValues, countryNames, countryCodes] = await Promise.all([
      this.getSurveyQuestionsValues([surveyId]), // 1. Add surveyQuestions, see README
      this.getSurveyCountryNames([surveyId]), // 2. Add countryNames
      this.getSurveyCountryCodes([surveyId]), // 3. Add countryCodes
    ]);

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

  /**
   * @param {import('@tupaia/types').Survey['id'][]} surveyIds
   */
  async getSurveyQuestionsValues(surveyIds) {
    if (!this.includeQuestions) return {};
    return await this.models.survey.getQuestionsValues(surveyIds);
  }

  /**
   * @param {import('@tupaia/types').Survey['id'][]} surveyIds
   * @returns {Promise<Record<Survey['id'], Country['name'][]>>}
   */
  async getSurveyCountryNames(surveyIds) {
    if (!this.includeCountryNames) return {};
    return await this.models.survey.getCountryNamesBySurveyId(surveyIds);
  }

  /**
   * @param {import('@tupaia/types').Survey['id'][]} surveyIds
   * @returns {Promise<Record<import('@tupaia/types').Survey['id'], Country['code'][]>>}
   */
  async getSurveyCountryCodes(surveyIds) {
    if (!this.includeCountryCodes) return {};
    return await this.models.survey.getCountryCodesBySurveyId(surveyIds);
  }
}
