/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { TaskResponse } from './TasksRequest';

export type Params = {
  taskId: string;
};

export type ResBody = TaskResponse;
export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
