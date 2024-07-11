/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Entity, Survey, UserAccount } from '../../models';

export type Params = Record<string, never>;
export type ResBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
export type ReqBody = {
  assigneeId?: UserAccount['id'];
  dueDate?: string;
  entityId: Entity['id'];
  repeatSchedule?: string;
  surveyCode: Survey['code'];
};
