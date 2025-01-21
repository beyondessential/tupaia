import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebUsersRequest } from '@tupaia/types';
import { getFilterUsersForProject } from '../utils';

export type ProjectUsersRequest = Request<
  DatatrakWebUsersRequest.Params,
  DatatrakWebUsersRequest.ResBody,
  DatatrakWebUsersRequest.ReqBody,
  DatatrakWebUsersRequest.ReqQuery
>;

export class ProjectUsersRoute extends Route<ProjectUsersRequest> {
  public async buildResponse() {
    const { models, params, query } = this.req;
    const { projectCode } = params;
    const { searchTerm } = query;

    return getFilterUsersForProject(models, projectCode, searchTerm);
  }
}
