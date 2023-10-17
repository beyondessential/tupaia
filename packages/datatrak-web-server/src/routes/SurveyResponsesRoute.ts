/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSurveyResponsesRequest } from '@tupaia/types';

export type SurveyResponsesRequest = Request<
  DatatrakWebSurveyResponsesRequest.Params,
  DatatrakWebSurveyResponsesRequest.ResBody,
  DatatrakWebSurveyResponsesRequest.ReqBody,
  DatatrakWebSurveyResponsesRequest.ReqQuery
>;

const DEFAULT_FIELDS = [
  'assessor_name',
  'country.name',
  'data_time',
  'entity.name',
  'id',
  'survey.name',
];

export class SurveyResponsesRoute extends Route<SurveyResponsesRequest> {
  public async buildResponse() {
    const { ctx, query } = this.req;

    const { fields = DEFAULT_FIELDS, userId: user_id } = query;

    const surveyResponses = await ctx.services.central.fetchResources('surveyResponses', {
      filter: { user_id },
      columns: fields,
    });

    return camelcaseKeys(surveyResponses, { deep: true });
  }
}
