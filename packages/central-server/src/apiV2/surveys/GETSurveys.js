/**
 * @typedef {import('@tupaia/types').Survey} Survey
 */

/* eslint-disable camelcase */
import { JOIN_TYPES, processColumns } from '@tupaia/database';
import { ensure } from '@tupaia/tsutils';
import { NotFoundError } from '@tupaia/utils';
import winston from '../../log';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { GETHandler } from '../GETHandler';
import {
  assertSurveyGetPermissions,
  createSurveyViaCountryDBFilter,
} from './assertSurveyPermissions';

const SURVEY_QUESTIONS_COLUMN = 'surveyQuestions';
const COUNTRY_NAMES_COLUMN = 'countryNames';
const COUNTRY_CODES_COLUMN = 'countryCodes';
const PAGINATED_QUESTIONS_COLUMN = 'paginatedQuestions';
const AD_HOC_COLUMNS = new Set(
  /** @type {const} */ ([
    COUNTRY_CODES_COLUMN,
    COUNTRY_NAMES_COLUMN,
    PAGINATED_QUESTIONS_COLUMN,
    SURVEY_QUESTIONS_COLUMN,
  ]),
);

/**
 * See ./README.md
 *
 * Handles endpoints:
 * - /surveys
 * - /surveys/id
 * - /countries/id/surveys
 */
export class GETSurveys extends GETHandler {
  permissionsFilteredInternally = /** @type {const} */ (true);

  defaultJoinType = JOIN_TYPES.LEFT_OUTER;

  /**
   * @type {boolean}
   * @see COUNTRY_CODES_COLUMN
   */
  includeCountryCodes = false;
  /**
   * @type {boolean}
   * @see COUNTRY_NAMES_COLUMN
   */
  includeCountryNames = true;
  /**
   * @type {boolean}
   * @see PAGINATED_QUESTIONS_COLUMN
   */
  includePaginatedQuestions = false;
  /**
   * @type {boolean}
   * @see SURVEY_QUESTIONS_COLUMN
   */
  includeQuestions = true;

  async findSingleRecord(surveyId, options) {
    const surveyChecker = accessPolicy =>
      assertSurveyGetPermissions(accessPolicy, this.models, surveyId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, surveyChecker]));

    if (this.includePaginatedQuestions && this.includeQuestions) {
      winston.warn(
        `Received ${this.req.method} ${this.req.originalUrl} request with both \`${SURVEY_QUESTIONS_COLUMN}\` and \`${PAGINATED_QUESTIONS_COLUMN}\` fields, which is redundant. Double check your \`fields\` query parameter.`,
      );
    }

    const survey = await super.findSingleRecord(surveyId, options);
    if (!survey) throw new NotFoundError(`No survey exists with ID ${surveyId}`);

    return await this.models.wrapInReadOnlyTransaction(async transactingModels => {
      const [countryCodes, countryNames, surveyQuestionsValues, paginatedQuestions] =
        await Promise.all([
          this.getSurveyCountryCodes(transactingModels, [surveyId]),
          this.getSurveyCountryNames(transactingModels, [surveyId]),
          this.getSurveyQuestionsValues(transactingModels, [surveyId]),
          this.includePaginatedQuestions
            ? ensure(
                await transactingModels.survey.findById(surveyId),
                `No survey exists with ID ${surveyId}`,
              ).getPaginatedQuestions()
            : Promise.resolve(undefined),
        ]);

      return {
        ...survey,
        surveyQuestions: surveyQuestionsValues[surveyId],
        countryNames: countryNames[surveyId],
        countryCodes: countryCodes[surveyId],
        screens: paginatedQuestions, // For datatrak-web (via datatrak-web-server)
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
    const dbConditions = await this.models.survey.createRecordsPermissionFilter(
      this.accessPolicy,
      criteria,
    );
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
    // 1. Strip out the `surveyQuestions` column, as we don't fetch it from the database
    //    See @tupaia/database/core/modelClasses/Survey/README.md
    // 2. Strip out the `countryNames` column, as the CRUD handler falls over with this
    /** @type {{ columns?: `[${string}]` }} */
    const { columns: columnsString } = this.req.query;

    if (!columnsString) return super.getProcessedColumns();

    // If specific columns requested, override all defaults
    /** @type {string[]} */
    const parsedColumns = columnsString && JSON.parse(columnsString);
    this.includeQuestions = parsedColumns.includes(SURVEY_QUESTIONS_COLUMN);
    this.includeCountryNames = parsedColumns.includes(COUNTRY_NAMES_COLUMN);
    this.includeCountryCodes = parsedColumns.includes(COUNTRY_CODES_COLUMN);
    this.includePaginatedQuestions = parsedColumns.includes(PAGINATED_QUESTIONS_COLUMN);

    const unprocessedColumns = parsedColumns.filter(col => !AD_HOC_COLUMNS.has(col));
    return processColumns(this.models, unprocessedColumns, this.recordType);
  }

  /**
   * @param {Survey['id'][]} surveyIds
   * @returns {Promise<Record<Survey['id'], Country['code'][]>>}
   */
  async getSurveyCountryCodes(models, surveyIds) {
    if (!this.includeCountryCodes) return {};
    return await models.survey.getCountryCodesBySurveyId(surveyIds);
  }

  /**
   * @param {Survey['id'][]} surveyIds
   * @returns {Promise<Record<Survey['id'], Country['name'][]>>}
   */
  async getSurveyCountryNames(models, surveyIds) {
    if (!this.includeCountryNames) return {};
    return await models.survey.getCountryNamesBySurveyId(surveyIds);
  }

  /**
   * @param {Survey['id'][]} surveyIds
   */
  async getSurveyQuestionsValues(models, surveyIds) {
    if (!this.includeQuestions) return {};
    return await models.survey.getQuestionsValues(surveyIds);
  }
}
