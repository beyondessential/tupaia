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
      ctx,
      params: { projectCode },
    } = this.req;

    const { projects } = await ctx.services.webConfig.fetchProjects({
      showExcludedProjects: false,
    });

    const project = projects.find(({ code }: { code: string }) => code === projectCode);
    if (!project) {
      throw new Error(`No project found with code '${projectCode}'`);
    }
    return project;
  }
}
