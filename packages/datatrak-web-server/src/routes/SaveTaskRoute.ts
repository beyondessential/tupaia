/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { Request } from 'express';
import { KeysToCamelCase, Task } from '@tupaia/types';
import { Route } from '@tupaia/server-boilerplate';

export type SaveTaskRequest = Request<
  Record<string, never>,
  {
    id: string;
    message: string;
  },
  KeysToCamelCase<Task>,
  Record<string, never>
>;

export class SaveTaskRoute extends Route<SaveTaskRequest> {
  public async buildResponse() {
    const { status } = this.req.body;
    const { taskId } = this.req.params;
    const { task } = this.req.models;

    // Update task if id exists
    if (taskId) {
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
