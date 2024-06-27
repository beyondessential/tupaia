/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { Request } from 'express';
import { KeysToCamelCase, Task } from '@tupaia/types';
import { Route } from '@tupaia/server-boilerplate';

// Todo: update api type with this
type TaskRequest = KeysToCamelCase<Task>;

type Params = Record<string, never>;
type ResBody = {
  id: string;
  message: string;
};
type ReqBody = Record<string, never>;
type ReqQuery = Record<string, never>;

export type SaveTaskRequest = Request<Params, ResBody, ReqBody, ReqQuery>;

export class SaveTaskRoute extends Route<SaveTaskRequest> {
  public async buildResponse() {
    const { status } = this.req.body;
    const { taskId } = this.req.params;
    const { task } = this.req.models;

    let result;

    // Update task if id exists
    if (taskId) {
      console.log('Update task', taskId, status);
      await task.updateById(taskId, { status });
    } else {
      // Todo: create new task record
      console.log('create new task record');
    }

    return {
      id: taskId,
      message: 'Task saved successfully',
    };
  }
}
