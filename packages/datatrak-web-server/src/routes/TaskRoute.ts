import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';

import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebTaskRequest, DatatrakWebTasksRequest } from '@tupaia/types';

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
  'entity.name',
  'entity.country_code',
  'entity.code',
  'assignee_name',
  'assignee_id',
  'task_status',
  'task_due_date',
  'repeat_schedule',
  'survey_id',
  'entity_id',
  'survey_response_id',
  'initial_request_id',
];

export class TaskRoute extends Route<TaskRequest> {
  public async buildResponse() {
    const { ctx, params, models } = this.req;
    const { taskId } = params;

    const task: DatatrakWebTasksRequest.RawTaskResult = await ctx.services.central.fetchResources(`tasks/${taskId}`, {
      columns: FIELDS,
    });
    if (!task) {
      throw new Error(`Task with id ${taskId} not found`);
    }

    const comments = await ctx.services.central.fetchResources(`tasks/${taskId}/taskComments`, {
      sort: ['created_at DESC'],
    });

    const formattedTask = await models.task.formatTaskForClient(task);

    return {
      ...formattedTask,
      comments: camelcaseKeys(comments, { deep: true }),
    };
  }
}
