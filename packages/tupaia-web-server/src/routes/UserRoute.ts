/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebUserRequest } from '@tupaia/types';

export type UserRequest = Request<
  TupaiaWebUserRequest.Params,
  TupaiaWebUserRequest.ResBody,
  TupaiaWebUserRequest.ReqBody,
  TupaiaWebUserRequest.ReqQuery
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
      first_name: firstName,
      last_name: lastName,
      email,
      preferences,
    } = await ctx.services.central.getUser();

    const userResponse: {
      userName: string;
      email: string;
      project?: {
        id: string;
        name: string;
        code: string;
        homeEntityCode: string;
        dashboardGroupName: string;
        defaultMeasure: string;
      };
    } = { userName: `${firstName} ${lastName}`, email };

    if (preferences?.project_id) {
      const { projects = [] } = await ctx.services.webConfig.fetchProjects({
        showExcludedProjects: false,
      });

      const { id, name, code, homeEntityCode, dashboardGroupName, defaultMeasure } = projects.find(
        ({ id }: { id: string }) => id === preferences?.project_id,
      );

      userResponse.project = {
        id,
        name,
        code,
        homeEntityCode,
        dashboardGroupName,
        defaultMeasure,
      };
    }

    return userResponse;
  }
}
