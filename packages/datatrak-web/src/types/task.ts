/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { DatatrakWebTasksRequest, TaskStatus } from '@tupaia/types';

enum OtherTaskStatus {
  overdue = 'overdue',
  repeating = 'repeating',
}

export type TaskStatusType = TaskStatus | OtherTaskStatus;

export type Task = DatatrakWebTasksRequest.ResBody['tasks'][0];

export type TaskFilterType = 'all_assignees_tasks' | 'all_completed_tasks' | 'all_cancelled_tasks';
