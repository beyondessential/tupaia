import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebProjectsRequest } from '@tupaia/types';

export type ProjectsRequest = Request<
  DatatrakWebProjectsRequest.Params,
  DatatrakWebProjectsRequest.ResBody,
  DatatrakWebProjectsRequest.ReqBody,
  DatatrakWebProjectsRequest.ReqQuery
>;

type ProjectT = DatatrakWebProjectsRequest.ResBody[0];

export class ProjectsRoute extends Route<ProjectsRequest> {
  public async buildResponse() {
    const { ctx } = this.req;
    const { projects } = await ctx.services.webConfig.fetchProjects();

    // Sort projects alphabetically. Sorting is not supported by the API so we do it here.
    return projects.sort((a: ProjectT, b: ProjectT) => a.name.localeCompare(b.name));
  }
}
