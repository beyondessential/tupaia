import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebTaskChangeRequest } from '@tupaia/types';

export type EditTaskRequest = Request<
  { taskId: string },
  { message: string },
  Partial<DatatrakWebTaskChangeRequest.ReqBody>,
  Record<string, never>
>;

export class EditTaskRoute extends Route<EditTaskRequest> {
  public async buildResponse() {
    const { body, ctx, params, models } = this.req;

    const { taskId } = params;
    const originalTask = await models.task.findById(taskId);

    const taskDetails = models.task.formatTaskChanges(body, originalTask);

    return ctx.services.central.updateResource(`tasks/${taskId}`, {}, taskDetails);
  }
}
