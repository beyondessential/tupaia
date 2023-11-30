/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';
import sortBy from 'lodash.sortby';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSurveyRequest, Survey } from '@tupaia/types';

type SingleSurveyResponse = DatatrakWebSurveyRequest.ResBody;

// Todo: consolidate types between SurveysRoute and SingleSurveyRoute
export type SurveysRequest = Request<
  DatatrakWebSurveyRequest.Params,
  SingleSurveyResponse[],
  DatatrakWebSurveyRequest.ReqBody,
  DatatrakWebSurveyRequest.ReqQuery
>;

export class SurveysRoute extends Route<SurveysRequest> {
  public async buildResponse() {
    const { ctx, query = {} } = this.req;
    const { fields = [], projectId } = query;

    const surveys = await ctx.services.central.fetchResources('surveys', {
      ...query,
      filter: {
        project_id: projectId,
      },
      columns: fields,
      pageSize: 'ALL', // Override default page size of 100
    });

    return sortBy(
      camelcaseKeys(surveys, {
        deep: true,
      }),
      ['name', 'surveyGroupName'],
    );
  }
}
