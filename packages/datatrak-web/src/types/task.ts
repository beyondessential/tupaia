/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { DatatrakWebTaskRequest, TaskStatus } from '@tupaia/types';

export type TaskStatusType = TaskStatus | 'overdue' | 'repeating';

export type Task = DatatrakWebTaskRequest.ResBody;
