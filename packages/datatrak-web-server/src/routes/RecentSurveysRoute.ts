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
    const {
      query: { userId, projectId },
      models,
    } = this.req;

    const surveyResponses = await models.user.getRecentSurveys(userId, projectId);

    return camelcaseKeys(surveyResponses) as unknown as DatatrakWebRecentSurveysRequest.ResBody;
  }
}
