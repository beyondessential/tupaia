/* eslint-disable camelcase */
import { JOIN_TYPES, processColumns } from '@tupaia/database';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { GETHandler } from '../GETHandler';
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
const AD_HOC_COLUMNS = new Set([
  COUNTRY_CODES_COLUMN,
  COUNTRY_NAMES_COLUMN,
  SURVEY_QUESTIONS_COLUMN,
]);

export class GETSurveys extends GETHandler {
  permissionsFilteredInternally = true;

  defaultJoinType = JOIN_TYPES.LEFT_OUTER;

  async findSingleRecord(surveyId, options) {
    const surveyChecker = accessPolicy =>
      assertSurveyGetPermissions(accessPolicy, this.models, surveyId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, surveyChecker]));

    const survey = await super.findSingleRecord(surveyId, options);
    return await this.models.wrapInReadOnlyTransaction(async transactingModels => {
      const [surveyQuestionsValues, countryNames, countryCodes] = await Promise.all([
        this.getSurveyQuestionsValues(transactingModels, [surveyId]),
        this.getSurveyCountryNames(transactingModels, [surveyId]),
        this.getSurveyCountryCodes(transactingModels, [surveyId]),
      ]);

      return {
        ...survey,
        surveyQuestions: surveyQuestionsValues[surveyId],
        countryNames: countryNames[surveyId],
        countryCodes: countryCodes[surveyId],
      };
    });
  }

  async findRecords(criteria, options) {
    const records = await super.findRecords(criteria, options);

    const recordIds = records.filter(record => record.id).map(record => record.id);
    return await this.models.wrapInReadOnlyTransaction(async transactingModels => {
      const [surveyQuestionsValues, countryNames, countryCodes] = await Promise.all([
        this.getSurveyQuestionsValues(transactingModels, recordIds),
        this.getSurveyCountryNames(transactingModels, recordIds),
        this.getSurveyCountryCodes(transactingModels, recordIds),
      ]);

      return records.map(record => ({
        ...record,
        surveyQuestions: surveyQuestionsValues[record.id],
        countryNames: countryNames[record.id],
        countryCodes: countryCodes[record.id],
      }));
    });
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

    const unprocessedColumns = parsedColumns.filter(col => !AD_HOC_COLUMNS.has(col));
    return processColumns(this.models, unprocessedColumns, this.recordType);
  }

  /**
   * @param {import('@tupaia/types').Survey['id'][]} surveyIds
   */
  async getSurveyQuestionsValues(models, surveyIds) {
    if (!this.includeQuestions) return {};
    return await models.survey.getQuestionsValues(surveyIds);
  }

  /**
   * @param {import('@tupaia/types').Survey['id'][]} surveyIds
   * @returns {Promise<Record<import('@tupaia/types').Survey['id'], Country['name'][]>>}
   */
  async getSurveyCountryNames(models, surveyIds) {
    if (!this.includeCountryNames) return {};
    return await models.survey.getCountryNamesBySurveyId(surveyIds);
  }

  /**
   * @param {import('@tupaia/types').Survey['id'][]} surveyIds
   * @returns {Promise<Record<import('@tupaia/types').Survey['id'], Country['code'][]>>}
   */
  async getSurveyCountryCodes(models, surveyIds) {
    if (!this.includeCountryCodes) return {};
    return await models.survey.getCountryCodesBySurveyId(surveyIds);
  }
}
