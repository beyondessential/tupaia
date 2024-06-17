/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { KeysToCamelCase } from '../../../utils/casing';
import { Entity, Survey, Task } from '../../models';

export type Params = Record<string, never>;

type TaskResponse = KeysToCamelCase<Task> & {
  assignee?: string;
  surveyName: Survey['name'];
  entity: Entity['name'];
};

export type ResBody = TaskResponse[];
export type ReqBody = Record<string, never>;
export interface ReqQuery {
  fields?: string[];
  pageSize?: number;
  sort?: string[];
  filter?: Record<string, string | string[]>;
  projectId?: string;
}
