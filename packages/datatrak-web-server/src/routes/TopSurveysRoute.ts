/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebTopSurveysRequest } from '@tupaia/types';

export type TopSurveysRequest = Request<
  DatatrakWebTopSurveysRequest.Params,
  DatatrakWebTopSurveysRequest.ResBody,
  DatatrakWebTopSurveysRequest.ReqBody,
  DatatrakWebTopSurveysRequest.ReqQuery
>;

export class TopSurveysRoute extends Route<TopSurveysRequest> {
  public async buildResponse() {
    const { query, models } = this.req;

    const { userId, projectId } = query;

    // The central server queries already built in don't support GROUP BY and this would be unnecessary to add for this one use case, so we use raw SQL in this instance

    // TODO: remove null project_id once all survey responses have a project_id
    const surveyResponses = await models.database.executeSql(
      `SELECT survey.name as survey_name, survey.code as survey_code, c.name as country_name, c.id as country_id, c.code as country_code from survey_response 
      JOIN survey ON survey.id=survey_response.survey_id 
      JOIN entity ON entity.id=survey_response.entity_id 
      JOIN entity c ON c.code=entity.country_code 
      where survey_response.user_id = ?
      AND (survey.project_id = ? OR survey.project_id IS NULL)
      GROUP BY survey.code, survey.name, c.name, c.id 
      ORDER BY MAX(survey_response.data_time) 
      desc LIMIT 6;`,
      [userId, projectId],
    );

    return camelcaseKeys(surveyResponses as DatatrakWebTopSurveysRequest.ResBody, {
      deep: true,
    });
  }
}
