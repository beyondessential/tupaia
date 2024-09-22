/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { KeysToCamelCase } from '../../../utils';
import { TaskComment } from '../../models';
import { TaskResponse } from './TasksRequest';

export type Params = {
  taskId: string;
};

type Comment = Omit<KeysToCamelCase<TaskComment>, 'createdAt'> & {
  // handle the fact that KeysToCamelCase changes Date keys to to camelCase as well
  createdAt: Date;
};
export type ResBody = TaskResponse & {
  comments: Comment[];
};
export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
