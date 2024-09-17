/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { LoginRoute as BaseLoginRoute } from '@tupaia/server-boilerplate';

type UserResponse = Record<any, any>;

export class LoginRoute extends BaseLoginRoute {
  // @ts-ignore LoginRoute types cannot be extended at this time
  public async buildResponse() {
    const { ctx } = this.req;
    const authResponse = await super.buildResponse();
    const user: UserResponse = authResponse.user;

    // @ts-ignore LoginRoute types cannot be extended at this time
    const { projects = [] } = await ctx.services.webConfig.fetchProjects({
      showExcludedProjects: false,
    });

    const projectId = user?.preferences?.project_id;
    if (projectId) {
      const { id, name, code, homeEntityCode, dashboardGroupName, defaultMeasure } = projects.find(
        ({ id }: { id: string }) => id === projectId,
      );
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
