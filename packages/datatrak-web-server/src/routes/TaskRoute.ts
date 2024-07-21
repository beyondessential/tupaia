/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebTaskRequest } from '@tupaia/types';
import { TaskT, formatTaskResponse } from '../utils';

export type TaskRequest = Request<
  DatatrakWebTaskRequest.Params,
  DatatrakWebTaskRequest.ResBody,
  DatatrakWebTaskRequest.ReqBody,
  DatatrakWebTaskRequest.ReqQuery
>;

const FIELDS = [
  'id',
  'survey.name',
  'survey.code',
  'entity.country_code',
  'entity.name',
  'assignee_name',
  'assignee_id',
  'task_status',
  'due_date',
  'repeat_schedule',
  'survey_id',
  'entity_id',
  'survey_response_id',
];

export class TaskRoute extends Route<TaskRequest> {
  public async buildResponse() {
    const { ctx, params } = this.req;
    const { taskId } = params;

    const task: TaskT = await ctx.services.central.fetchResources(`tasks/${taskId}`, {
      columns: FIELDS,
    });
    if (!task) {
      throw new Error(`Task with id ${taskId} not found`);
    }

    return formatTaskResponse(task);
  }
}
