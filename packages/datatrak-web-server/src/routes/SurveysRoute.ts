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
      columns: [...fields, 'project_id'], // TODO: remove this when this is a db filter for project_id
      pageSize: 'ALL', // Override default page size of 100
    });

    // TODO: make this a db filter when survey project_id field is non-nullable. For now, we need to manually filter
    const projectSurveys = surveys.filter(
      (survey: Survey) => survey.project_id === null || survey.project_id === projectId,
    );

    return sortBy(
      camelcaseKeys(projectSurveys, {
        deep: true,
      }),
      ['name', 'surveyGroupName'],
    );
  }
}
