/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebRecentSurveysRequest } from '@tupaia/types';

export type RecentSurveysRequest = Request<
  DatatrakWebRecentSurveysRequest.Params,
  DatatrakWebRecentSurveysRequest.ResBody,
  DatatrakWebRecentSurveysRequest.ReqBody,
  DatatrakWebRecentSurveysRequest.ReqQuery
>;

export class RecentSurveysRoute extends Route<RecentSurveysRequest> {
  public async buildResponse() {
    const { query, models } = this.req;

    const { userId } = query;

    const surveyResponses = await models.database.executeSql(
      `SELECT survey.name as survey_name, survey.code as survey_code, country.name as country_name from survey_response INNER JOIN survey ON survey.id=survey_response.survey_id INNER JOIN entity ON entity.id=survey_response.entity_id INNER JOIN country ON country.code=entity.country_code where survey_response.user_id = '${userId}' GROUP BY survey.code,survey.name, country.name ORDER BY MAX(survey_response.data_time) desc LIMIT 6`,
    );

    return camelcaseKeys(surveyResponses as DatatrakWebRecentSurveysRequest.ResBody, {
      deep: true,
    });
  }
}
