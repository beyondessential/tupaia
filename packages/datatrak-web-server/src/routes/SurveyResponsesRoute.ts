/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';
import { Route } from '@tupaia/server-boilerplate';
import {
  DatatrakWebSurveyResponsesRequest,
  SurveyResponse,
  Country,
  Entity,
  Survey,
} from '@tupaia/types';

export type SurveyResponsesRequest = Request<
  DatatrakWebSurveyResponsesRequest.Params,
  DatatrakWebSurveyResponsesRequest.ResBody,
  DatatrakWebSurveyResponsesRequest.ReqBody,
  DatatrakWebSurveyResponsesRequest.ReqQuery
>;

type SurveyResponseT = Record<string, any> & {
  assessor_name: SurveyResponse['assessor_name'];
  'country.name': Country['name'];
  data_time: Date;
  'entity.name': Entity['name'];
  id: SurveyResponse['id'];
  'survey.name': Survey['name'];
  'survey.project_id': Survey['project_id'];
};

const DEFAULT_FIELDS = [
  'assessor_name',
  'country.name',
  'country.code',
  'data_time',
  'entity.name',
  'id',
  'survey.name',
  'survey.code',
];

const DEFAULT_LIMIT = 16;

const DEFAULT_SORT = ['data_time DESC'];

export class SurveyResponsesRoute extends Route<SurveyResponsesRequest> {
  public async buildResponse() {
    const { ctx, query } = this.req;

    const {
      fields = DEFAULT_FIELDS,
      pageSize = DEFAULT_LIMIT,
      sort = DEFAULT_SORT,
      userId: user_id,
      projectId,
    } = query;

    const surveyResponses = await ctx.services.central.fetchResources('surveyResponses', {
      filter: {
        user_id,
      },
      columns: [...fields, 'survey.project_id'], // TODO: remove this when this is a db filter for project_id
      pageSize,
      sort,
    });

    // TODO: make this a db filter when survey project_id field is non-nullable. For now, we need to manually filter
    const projectSurveyResponses = surveyResponses.filter(
      (surveyResponse: SurveyResponseT) =>
        surveyResponse['survey.project_id'] === null ||
        surveyResponse['survey.project_id'] === projectId,
    );
    return camelcaseKeys(projectSurveyResponses, { deep: true });
  }
}
