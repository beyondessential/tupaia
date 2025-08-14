import { DatatrakWebTaskRequest, TaskStatus } from '@tupaia/types';

export type TaskStatusType = TaskStatus | 'overdue' | 'repeating';

export type SingleTaskResponse = DatatrakWebTaskRequest.ResBody;

export type TaskFilterType =
  | 'all_assignees_tasks'
  | 'show_completed_tasks'
  | 'show_cancelled_tasks';
