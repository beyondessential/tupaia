/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

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

    return {
      ...survey,
      surveyQuestions: surveyQuestionsValues[surveyId],
      countryNames: countryNames[surveyId],
    };
  }

  async findRecords(criteria, options) {
    const records = await super.findRecords(criteria, options);

    // 1. Add surveyQuestions, see README
    const surveyQuestionsValues = await this.getSurveyQuestionsValues(
      records.filter(record => record.id).map(record => record.id),
    );

    // 2. Add countryNames
    const countryNames = await this.getSurveyCountryNames(
      records.filter(record => record.id).map(record => record.id),
    );

    return records.map(record => ({
      ...record,
      surveyQuestions: surveyQuestionsValues[record.id],
      countryNames: countryNames[record.id],
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
      return super.getProcessedColumns();
    }

    const unprocessedColumns =
      columnsString &&
      JSON.parse(columnsString).filter(col => !['surveyQuestions', 'countryNames'].includes(col));
    return processColumns(this.models, unprocessedColumns, this.recordType);
  }

  async getSurveyQuestionsValues(surveyIds) {
    // See README.md
    if (surveyIds.length === 0) return {};
    const rows = await this.database.executeSql(
      `
    SELECT survey.id, count(survey.id) AS num_questions
    FROM survey
    LEFT JOIN survey_screen ss on survey.id = ss.survey_id
    LEFT JOIN survey_screen_component ssc on ss.id = ssc.screen_id
    WHERE survey.id in (${surveyIds.map(id => '?').join(',')})
    GROUP BY survey.id
    `,
      surveyIds,
    );
    return Object.fromEntries(rows.map(row => [row.id, `${row.num_questions} Questions`]));
  }

  async getSurveyCountryNames(surveyIds) {
    if (surveyIds.length === 0) return {};
    const rows = await this.database.executeSql(
      `
    SELECT survey.id, array_agg(country.name) as country_names
    FROM survey
    LEFT JOIN country ON (country.id = any(survey.country_ids))
    WHERE survey.id in (${surveyIds.map(id => '?').join(',')})
    GROUP BY survey.id;
    `,
      surveyIds,
    );
    return Object.fromEntries(rows.map(row => [row.id, row.country_names]));
  }
}
