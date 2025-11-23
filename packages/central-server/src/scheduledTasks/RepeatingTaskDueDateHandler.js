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
    const repeatingTasks = await task.find(
      {
        task_status: 'repeating',
        due_date: { comparator: '<', comparisonValue: Date.now() },
      },
      {
        columns: ['task.id', 'repeat_schedule'],
      },
    );

    winston.info(`Found ${repeatingTasks.length} repeating task(s)`);

    // update the due date for each repeating task to the next occurrence
    for (const repeatingTask of repeatingTasks) {
      const { repeat_schedule: repeatSchedule } = repeatingTask;

      const nextDueDate = getNextOccurrence({
        ...repeatSchedule,
        dtstart: new Date(repeatSchedule.dtstart), // convert string to date because rrule.js expects a Date object
      });

      await task.updateById(repeatingTask.id, { due_date: new Date(nextDueDate).getTime() });

      winston.info(`Updated due date for task ${repeatingTask.id} to ${nextDueDate}`);
    }
  }
}
