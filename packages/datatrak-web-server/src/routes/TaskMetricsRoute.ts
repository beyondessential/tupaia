import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebTaskMetricsRequest } from '@tupaia/types';

export type TaskMetricsRequest = Request<
  DatatrakWebTaskMetricsRequest.Params,
  DatatrakWebTaskMetricsRequest.ResBody,
  DatatrakWebTaskMetricsRequest.ReqBody,
  DatatrakWebTaskMetricsRequest.ReqQuery
>;

export class TaskMetricsRoute extends Route<TaskMetricsRequest> {
  public async buildResponse() {
    const { params, models } = this.req;
    const { projectId } = params;

    const unassignedTasks = await models.task.countUnassignedTasks(projectId);
    const overdueTasks = await models.task.countOverdueTasks(projectId);
    const onTimeCompletionRate = await models.task.calculateOnTimeCompletionRate(projectId);

    return {
      unassignedTasks,
      overdueTasks,
      onTimeCompletionRate,
    };
  }
}
