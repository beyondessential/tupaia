/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Survey, Task } from '../../models';

export type Params = Record<string, never>;
export type ResBody = {
  message: string;
};
export type ReqQuery = Record<string, never>;
export type ReqBody = Partial<Pick<Task, 'due_date' | 'repeat_schedule'>> & {
  survey_code: Survey['code'];
  comment?: string;
  assignee?: {
    value: string;
    label: string;
  } | null;
};
