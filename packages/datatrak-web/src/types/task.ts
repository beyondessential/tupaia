/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { DatatrakWebTasksRequest, TaskStatus } from '@tupaia/types';

export type TaskStatusType = TaskStatus | 'overdue' | 'repeating';

export type Task = DatatrakWebTasksRequest.ResBody['tasks'][0];

export type TaskFilterType =
  | 'all_assignees_tasks'
  | 'show_completed_tasks'
  | 'show_cancelled_tasks';
