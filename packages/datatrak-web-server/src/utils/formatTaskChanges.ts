/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { DatatrakWebTaskChangeRequest, Task } from '@tupaia/types';
import { stripTimezoneFromDate } from '@tupaia/utils';

type Input = Partial<DatatrakWebTaskChangeRequest.ReqBody> &
  Partial<Pick<Task, 'entity_id' | 'survey_id' | 'status'>>;

type Output = Partial<Task> & {
  comment?: string;
};

export const formatTaskChanges = (task: Input) => {
  const { due_date: dueDate, repeat_schedule: repeatSchedule, ...restOfTask } = task;

  const taskDetails: Output = restOfTask;

  if (repeatSchedule) {
    // if task is repeating, clear due date
    taskDetails.repeat_schedule = {
      // TODO: format this correctly when recurring tasks are implemented
      frequency: repeatSchedule,
    };
    taskDetails.due_date = null;
  } else if (dueDate) {
    // apply status and due date only if not a repeating task
    const unix = new Date(dueDate).getTime();

    taskDetails.due_date = unix;
    taskDetails.repeat_schedule = null;
  }

  return taskDetails;
};
