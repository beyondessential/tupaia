import { isNotNullish } from '@tupaia/tsutils';
import { DatatrakWebTaskChangeRequest, Task } from '@tupaia/types';
import { generateRRule } from '@tupaia/utils';

type Input = Partial<DatatrakWebTaskChangeRequest.ReqBody> &
  Partial<Pick<Task, 'entity_id' | 'survey_id' | 'status'>>;

type Output = Partial<Task> & {
  comment?: string;
};

export const formatTaskChanges = (task: Input, originalTask?: Task) => {
  const { due_date: dueDate, repeat_frequency: frequency, assignee, ...restOfTask } = task;

  const taskDetails: Output = restOfTask;

  if (
    isNotNullish(frequency) ||
    (originalTask?.repeat_schedule && frequency === undefined && dueDate)
  ) {
    // if there is no due date to use, use the original task's due date (this will be the case when editing a task's repeat schedule without changing the due date)
    const dueDateToUse = dueDate || originalTask?.due_date;

    // if there is no due date to use, throw an error - this should never happen but is a safety check
    if (!dueDateToUse) {
      throw new Error('Must have a due date');
    }

    // if frequency is explicitly set, use that, otherwise use the original task's frequency. This is for when editing a repeating task's due date, because we will want to update the 'dtstart' of the rrule
    const frequencyToUse = frequency ?? originalTask?.repeat_schedule?.freq;
    // if task is repeating, generate rrule
    const rrule = generateRRule(dueDateToUse, frequencyToUse);
    // set repeat_schedule to the original options object so we can use it to generate next occurrences and display the schedule
    taskDetails.repeat_schedule = rrule.origOptions;
  }

  // if frequency is explicitly set to null, set repeat_schedule to null
  if (frequency === null) {
    taskDetails.repeat_schedule = null;
  }

  // if there is a due date, convert it to unix
  if (dueDate) {
    const unix = new Date(dueDate).getTime();

    taskDetails.due_date = unix;
  }

  if (assignee !== undefined) {
    taskDetails.assignee_id = assignee?.value ?? null;
  }

  return taskDetails;
};
