/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSurveysRequest } from '@tupaia/types';

export type SurveyRequest = Request<
  DatatrakWebSurveysRequest.Params,
  DatatrakWebSurveysRequest.ResBody[number],
  DatatrakWebSurveysRequest.ReqBody,
  DatatrakWebSurveysRequest.ReqQuery
>;

export class SurveyRoute extends Route<SurveyRequest> {
  public async buildResponse() {
    const {
      ctx,
      query = {},
      params: { surveyCode },
    } = this.req;
    const { fields } = query;
    const surveys = await ctx.services.central.fetchResources('surveys', {
      filter: { code: surveyCode },
      columns: fields,
    });
    if (!surveys.length) throw new Error(`Survey with code ${surveyCode} not found`);
    return camelcaseKeys(surveys[0], { deep: true });
  }
}
