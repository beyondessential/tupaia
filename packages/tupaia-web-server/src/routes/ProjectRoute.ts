/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';

export type ProjectRequest = Request<{ projectCode: string }, any, any, any>;

export class ProjectRoute extends Route<ProjectRequest> {
  public async buildResponse() {
    const {
      ctx,
      params: { projectCode },
    } = this.req;

    const { projects } = await ctx.services.webConfig.fetchProjects();

    const project = projects.find(({ code }: { code: string }) => code === projectCode);
    if (!project) {
      throw new Error(`No project found with code '${projectCode}'`);
    }
    return project;
  }
}
