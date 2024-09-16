/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { LoginRoute as BaseLoginRoute } from '@tupaia/server-boilerplate';
import { WebServerProjectRequest } from '@tupaia/types';

export type LoginRequest = Request<
  WebServerProjectRequest.Params,
  WebServerProjectRequest.ResBody,
  WebServerProjectRequest.ReqBody,
  WebServerProjectRequest.ReqQuery
>;

export class LoginRoute extends BaseLoginRoute {
  // @ts-ignore
  public async buildResponse() {
    const { ctx } = this.req;
    const { user } = await super.buildResponse();

    // @ts-ignore
    const { projects = [] } = await ctx.services.webConfig.fetchProjects({
      showExcludedProjects: false,
    });

    // @ts-ignore
    const projectId = user?.preferences?.project_id;
    if (projectId) {
      const { id, name, code, homeEntityCode, dashboardGroupName, defaultMeasure } = projects.find(
        ({ id }: { id: string }) => id === projectId,
      );
      // @ts-ignore
      user.project = {
        id,
        name,
        code,
        homeEntityCode,
        dashboardGroupName,
        defaultMeasure,
      };
    }
    return user;
  }
}
