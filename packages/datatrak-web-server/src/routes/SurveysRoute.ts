/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';
import sortBy from 'lodash.sortby';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSurveyRequest } from '@tupaia/types';

type Survey = DatatrakWebSurveyRequest.ResBody;

export type SurveysRequest = Request<
  DatatrakWebSurveyRequest.Params,
  Survey[],
  DatatrakWebSurveyRequest.ReqBody,
  DatatrakWebSurveyRequest.ReqQuery
>;

export class SurveysRoute extends Route<SurveysRequest> {
  public async buildResponse() {
    const { ctx, query = {} } = this.req;
    const { fields } = query;
    const surveys = await ctx.services.central.fetchResources('surveys', {
      columns: fields,
    });
    return sortBy(
      camelcaseKeys(surveys, {
        deep: true,
      }),
      ['name', 'surveyGroupName'],
    );
  }
}
