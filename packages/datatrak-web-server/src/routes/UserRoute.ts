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
      preferences = {},
    } = await ctx.services.central.getUser();

    const { project_id: projectId, country_id: countryId } = preferences;

    let project = null;
    let country = null;
    if (projectId) {
      const { projects } = await ctx.services.webConfig.fetchProjects();
      project = projects.find((p: WebServerProjectRequest.ResBody) => p.id === projectId);
    }
    if (countryId) {
      const countryResponse = await ctx.services.central.fetchResources(`/entities/${countryId}`, {
        columns: ['id', 'name', 'code'],
      });
      console.log(countryResponse);
      country = countryResponse || null;
    }

    return {
      userName: `${firstName} ${lastName}`,
      email,
      id,
      projectId,
      project,
      country,
    };
  }
}
