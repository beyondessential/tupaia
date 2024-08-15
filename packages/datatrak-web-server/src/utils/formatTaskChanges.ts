/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { isNotNullish } from '@tupaia/tsutils';
import { DatatrakWebTaskChangeRequest, Task } from '@tupaia/types';
import { stripTimezoneFromDate, generateRRule } from '@tupaia/utils';

type Input = Partial<DatatrakWebTaskChangeRequest.ReqBody> &
  Partial<Pick<Task, 'entity_id' | 'survey_id' | 'status'>>;

type Output = Partial<Omit<Task, 'due_date'>> & {
  due_date?: string | null;
  comment?: string;
};

const convertDateToEndOfDay = (date: Date) => {
  const dateObj = new Date(date);
  const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));
  return endOfDay;
};

export const formatTaskChanges = (task: Input, originalTask?: Task) => {
  const { due_date: dueDate, repeat_frequency: frequency, ...restOfTask } = task;

  const taskDetails: Output = restOfTask;

  if (isNotNullish(frequency)) {
    const dueDateToUse = dueDate || originalTask?.due_date;
    if (!dueDateToUse) {
      throw new Error('Must have a due date');
    }
    const endOfDay = convertDateToEndOfDay(dueDateToUse);
    // if task is repeating, generate rrule
    const rrule = generateRRule(endOfDay, frequency);
    // set repeat_schedule to the original options object so we can use it to generate next occurences and display the schedule
    taskDetails.repeat_schedule = rrule.origOptions;
  }

  if (dueDate) {
    const endOfDay = convertDateToEndOfDay(dueDate);
    // strip timezone from date so that the returned date is always in the user's timezone
    const withoutTimezone = stripTimezoneFromDate(endOfDay);
    taskDetails.due_date = withoutTimezone;
  }

  return taskDetails;
};
