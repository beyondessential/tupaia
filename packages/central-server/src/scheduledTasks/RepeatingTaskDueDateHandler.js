/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import winston from 'winston';
import { getNextOccurrence } from '@tupaia/utils';
import { ScheduledTask } from './ScheduledTask';

export class RepeatingTaskDueDateHandler extends ScheduledTask {
  constructor(models) {
    // run RepeatingTaskDueDateHandler every hour
    super(models, 'RepeatingTaskDueDateHandler', '0 * * * *');
  }

  async run() {
    const { task } = this.models;
    // find all repeating tasks that have passed their current due date
    const repeatingTasks = await task.find({
      task_status: 'repeating',
      due_date: { comparator: '<', comparisonValue: new Date().getTime() },
    });

    winston.info(`Found ${repeatingTasks.length} repeating task(s)`);

    // update the due date for each repeating task to the next occurrence
    for (const repeatingTask of repeatingTasks) {
      const { repeat_schedule: repeatSchedule } = repeatingTask;

      const nextDueDate = getNextOccurrence({
        ...repeatSchedule,
        dtstart: new Date(repeatSchedule.dtstart), // convert string to date because rrule.js expects a Date object
      });

      repeatingTask.due_date = nextDueDate;
      await repeatingTask.save();

      winston.info(`Updated due date for task ${repeatingTask.id} to ${nextDueDate}`);
    }
  }
}
