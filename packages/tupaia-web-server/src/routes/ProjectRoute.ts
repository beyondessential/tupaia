import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { WebServerProjectRequest } from '@tupaia/types';

export type ProjectRequest = Request<
  WebServerProjectRequest.Params,
  WebServerProjectRequest.ResBody,
  WebServerProjectRequest.ReqBody,
  WebServerProjectRequest.ReqQuery
>;

export class ProjectRoute extends Route<ProjectRequest> {
  public async buildResponse() {
    const {
      params: { projectCode },
      ctx,
    } = this.req;

    return await ctx.services.webConfig.fetchProject(projectCode, {
      showExcludedProjects: false,
    });
  }
}
