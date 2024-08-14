/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { DatatrakWebTaskChangeRequest, Task } from '@tupaia/types';
import { stripTimezoneFromDate, generateRRule } from '@tupaia/utils';

type Input = Partial<DatatrakWebTaskChangeRequest.ReqBody> &
  Partial<Pick<Task, 'entity_id' | 'survey_id' | 'status'>>;

type Output = Partial<Omit<Task, 'due_date'>> & {
  due_date?: string | null;
  comment?: string;
};

export const formatTaskChanges = (task: Input) => {
  const { due_date: dueDate, repeat_frequency: frequency, ...restOfTask } = task;

  const taskDetails: Output = restOfTask;
  if (!dueDate) {
    throw new Error('Due date is required');
  }

  const dueDateObject = new Date(dueDate);
  const endOfDay = new Date(dueDateObject.setHours(23, 59, 59, 999));

  // strip timezone from date so that the returned date is always in the user's timezone
  const withoutTimezone = stripTimezoneFromDate(endOfDay);

  if (frequency) {
    // if task is repeating, generate rrule
    const rrule = generateRRule(endOfDay, frequency);
    // set repeat_schedule to the original options object so we can use it to generate next occurences and display the schedule
    taskDetails.repeat_schedule = rrule.origOptions;
  } else {
    taskDetails.repeat_schedule = null;
  }

  taskDetails.due_date = withoutTimezone;

  return taskDetails;
};
