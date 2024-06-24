/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { TaskStatus } from '@tupaia/types';
enum OtherTaskStatus {
  overdue = 'overdue',
  repeating = 'repeating',
}

export type TaskStatusType = TaskStatus | OtherTaskStatus;
