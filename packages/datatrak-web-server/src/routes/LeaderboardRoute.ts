import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebLeaderboardRequest } from '@tupaia/types';

export type LeaderboardRequest = Request<
  DatatrakWebLeaderboardRequest.Params,
  DatatrakWebLeaderboardRequest.ResBody,
  DatatrakWebLeaderboardRequest.ReqBody,
  DatatrakWebLeaderboardRequest.ReqQuery
>;

export class LeaderboardRoute extends Route<LeaderboardRequest> {
  public async buildResponse() {
    const { models, query = {} } = this.req;

    const leaderboard = await models.surveyResponse.getLeaderboard(query.projectId);
    return camelcaseKeys(leaderboard, { deep: true });
  }
}
