/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebProjectsRequest } from '@tupaia/types';

export type ProjectsRequest = Request<
  DatatrakWebProjectsRequest.Params,
  DatatrakWebProjectsRequest.ResBody,
  DatatrakWebProjectsRequest.ReqBody,
  DatatrakWebProjectsRequest.ReqQuery
>;

export class ProjectsRoute extends Route<ProjectsRequest> {
  public async buildResponse() {
    const { ctx } = this.req;
    const { projects } = await ctx.services.webConfig.fetchProjects();
    return projects;
  }
}
