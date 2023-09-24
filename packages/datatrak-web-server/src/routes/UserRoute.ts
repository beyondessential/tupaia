/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebUserRequest, WebServerProjectRequest } from '@tupaia/types';

export type UserRequest = Request<
  DatatrakWebUserRequest.Params,
  DatatrakWebUserRequest.ResBody,
  DatatrakWebUserRequest.ReqBody,
  DatatrakWebUserRequest.ReqQuery
>;

export class UserRoute extends Route<UserRequest> {
  public async buildResponse() {
    const { ctx, session } = this.req;

    // Avoid sending a 'me' request as the api user
    if (!session) {
      // Triggers frontend login
      return {};
    }

    const {
      id,
      first_name: firstName,
      last_name: lastName,
      email,
      project_id: projectId,
    } = await ctx.services.central.getUser();

    let project = null;
    if (projectId) {
      const { projects } = await ctx.services.webConfig.fetchProjects();
      project = projects.find((p: WebServerProjectRequest.ResBody) => p.id === projectId);
    }

    return { userName: `${firstName} ${lastName}`, email, id, projectId, project };
  }
}
