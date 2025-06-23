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
      projectId: project_id,
    } = query;

    const surveyResponses = await ctx.services.central.fetchResources('surveyResponses', {
      filter: {
        user_id,
        'survey.project_id': project_id,
      },
      columns: fields,
      pageSize,
      sort,
    });

    return camelcaseKeys(surveyResponses, { deep: true });
  }
}
