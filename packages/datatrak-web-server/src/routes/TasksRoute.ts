/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';
import sortBy from 'lodash.sortby';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebTasksRequest } from '@tupaia/types';

export type TasksRequest = Request<
  DatatrakWebTasksRequest.Params,
  DatatrakWebTasksRequest.ResBody,
  DatatrakWebTasksRequest.ReqBody,
  DatatrakWebTasksRequest.ReqQuery
>;

export class TasksRoute extends Route<TasksRequest> {
  public async buildResponse() {
    const { ctx, query = {} } = this.req;
    const { fields = [], filter = {}, projectId, pageSize, sort } = query;

    const tasks = await ctx.services.central.fetchResources('tasks', {
      ...query,
      filter: {
        ...filter,
        project_id: projectId,
      },
      columns: fields,
      sort,
      pageSize,
    });

    return camelcaseKeys(tasks, {
      deep: true,
    });
  }
}
