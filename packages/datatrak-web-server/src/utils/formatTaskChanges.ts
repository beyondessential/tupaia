/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { isNotNullish } from '@tupaia/tsutils';
import { DatatrakWebTaskChangeRequest, Task } from '@tupaia/types';
import { generateRRule } from '@tupaia/utils';

type Input = Partial<DatatrakWebTaskChangeRequest.ReqBody> &
  Partial<Pick<Task, 'entity_id' | 'survey_id' | 'status'>>;

type Output = Partial<Task> & {
  comment?: string;
};

const convertDateToEndOfDay = (date: Date | number) => {
  const dateObj = new Date(date);
  const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));
  return endOfDay;
};

export const formatTaskChanges = (task: Input, originalTask?: Task) => {
  const { due_date: dueDate, repeat_frequency: frequency, assignee, ...restOfTask } = task;

  const taskDetails: Output = restOfTask;

  if (isNotNullish(frequency)) {
    // if there is no due date to use, use the original task's due date (this will be the case when editing a task's repeat schedule without changing the due date)
    const dueDateToUse = dueDate || originalTask?.due_date;
    // if there is no due date to use, throw an error - this should never happen but is a safety check
    if (!dueDateToUse) {
      throw new Error('Must have a due date');
    }
    const endOfDay = convertDateToEndOfDay(dueDateToUse);
    // if task is repeating, generate rrule
    const rrule = generateRRule(endOfDay, frequency);
    // set repeat_schedule to the original options object so we can use it to generate next occurrences and display the schedule
    taskDetails.repeat_schedule = rrule.origOptions;
  }

  // if frequency is explicitly set to null, set repeat_schedule to null
  if (frequency === null) {
    taskDetails.repeat_schedule = null;
  }

  // if there is a due date, convert it to unix
  if (dueDate) {
    const endOfDay = convertDateToEndOfDay(dueDate);
    const unix = new Date(endOfDay).getTime();

    taskDetails.due_date = unix;
  }

  if (assignee !== undefined) {
    taskDetails.assignee_id = assignee?.value ?? null;
  }

  return taskDetails;
};
