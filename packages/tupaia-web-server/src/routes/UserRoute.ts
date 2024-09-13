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

function snakeToCapitalCase(str: string) {
  return str
    .toLowerCase() // Convert the whole string to lowercase
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize the first letter of each word
}

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

    let project;

    if (preferences?.project_id) {
      [project] = await this.req.ctx.services.central.fetchResources('projects', {
        filter: {
          id: preferences.project_id,
        },
        columns: ['id', 'code'],
      });
      project = {
        name: snakeToCapitalCase(project.code),
        code: project.code,
        id: project.id,
      };
    }

    return { userName: `${firstName} ${lastName}`, email, project };
  }
}
