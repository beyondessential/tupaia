/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { KeysToCamelCase } from '../../../utils/casing';
import { Entity, Survey, Task, TaskStatus } from '../../models';

export type Params = Record<string, never>;

type TaskResponse = KeysToCamelCase<Omit<Task, 'due_date' | 'repeat_schedule'>> & {
  assigneeName?: string;
  taskStatus: TaskStatus | 'overdue' | 'repeating';
  survey: {
    name: Survey['name'];
    id: Survey['id'];
    code: Survey['code'];
  };
  entity: {
    name: Entity['name'];
    id: Entity['id'];
    countryCode: string; // this is not undefined or null so use string explicitly here
  };
  dueDate?: Task['due_date']; // separately define this so that the Date object doesn't get included in KeysToCamelCase
  repeatSchedule?: {
    frequency?: string;
  } | null;
};

export type ResBody = {
  tasks: TaskResponse[];
  count: number;
  numberOfPages: number;
};
export type ReqBody = Record<string, never>;
export interface ReqQuery {
  fields?: string[];
  pageSize?: number;
  sort?: string[];
  page?: number;
  filters?: Record<string, string>[];
}
