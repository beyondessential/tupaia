/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { DatatrakWebTasksRequest, TaskStatus } from '@tupaia/types';

export type TaskStatusType = TaskStatus | 'overdue' | 'repeating';

export type Task = DatatrakWebTasksRequest.ResBody['tasks'][0];
