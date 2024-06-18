/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { KeysToCamelCase } from '../../../utils/casing';
import { Entity, Survey, Task, UserAccount } from '../../models';

export type Params = Record<string, never>;

type TaskResponse = KeysToCamelCase<Task> & {
  assignee?: {
    name: string;
    id: UserAccount['id'];
  };
  survey: {
    name: Survey['name'];
    id: Survey['id'];
  };
  entity: {
    name: Entity['name'];
    id: Entity['id'];
  };
};

export type ResBody = TaskResponse[];
export type ReqBody = Record<string, never>;
export interface ReqQuery {
  fields?: string[];
  pageSize?: number;
  sort?: string[];
  page?: number;
  filter?: Record<string, string | string[]>;
}
