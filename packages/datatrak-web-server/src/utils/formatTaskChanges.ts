/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { DatatrakWebTaskChangeRequest, Task } from '@tupaia/types';
import { stripTimezoneFromDate } from '@tupaia/utils';

type Input = Partial<DatatrakWebTaskChangeRequest.ReqBody> &
  Partial<Pick<Task, 'entity_id' | 'survey_id' | 'status'>>;

type Output = Partial<Omit<Task, 'due_date'>> & {
  due_date?: string | null;
};

export const formatTaskChanges = (task: Input) => {
  const { dueDate, repeatSchedule, assigneeId, ...restOfTask } = task;

  const taskDetails: Output & {
    due_date?: string | null;
  } = { assignee_id: assigneeId, ...restOfTask };

  if (repeatSchedule) {
    // if task is repeating, clear due date
    taskDetails.repeat_schedule = JSON.stringify({
      // TODO: format this correctly when recurring tasks are implemented
      frequency: repeatSchedule,
    });
    taskDetails.due_date = null;
  } else if (dueDate) {
    // apply status and due date only if not a repeating task
    // set due date to end of day
    const endOfDay = new Date(new Date(dueDate).setHours(23, 59, 59, 999));

    // strip timezone from date so that the returned date is always in the user's timezone
    const withoutTimezone = stripTimezoneFromDate(endOfDay);

    taskDetails.due_date = withoutTimezone;
  }

  return taskDetails;
};