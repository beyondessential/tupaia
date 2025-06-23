import { KeysToCamelCase } from '../../../utils';
import { TaskComment } from '../../models';
import { TaskResponse } from './TasksRequest';

export type Params = {
  taskId: string;
};

export interface TaskResponseItem extends Omit<KeysToCamelCase<TaskComment>, 'createdAt'> {
  /** ISO 8601 format (e.g. '2025-04-21T21:30:48.344Z') */
  createdAt: string;
}
export interface ResBody extends TaskResponse {
  comments: TaskResponseItem[];
}
export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
