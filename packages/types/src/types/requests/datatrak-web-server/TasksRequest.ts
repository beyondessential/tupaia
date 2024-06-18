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
    code: Survey['code'];
  };
  entity: {
    name: Entity['name'];
    id: Entity['id'];
    countryCode: string; // this is not undefined or null so use string explicitly here
  };
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
  filter?: Record<string, string | string[]>;
}
