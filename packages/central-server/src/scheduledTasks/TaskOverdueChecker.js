/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { ScheduledTask } from './ScheduledTask';

export class TaskOverdueChecker extends ScheduledTask {
  getSchedule() {
    return '* * * * *';
  }

  getName() {
    return 'TaskOverdueChecker';
  }

  constructor(models) {
    super();
    this.models = models;
  }

  async run() {
    const { task, user } = this.models;
    const overdueTasks = await task.find({
      task_status: 'overdue',
    });

    console.log('overdueTasks', overdueTasks.length);

    for (const task of overdueTasks) {
      console.log('task', task.assignee_id);
      const assignee = await user.findById(task.assignee_id);
      console.log('assigneeEmail', assignee.email);
    }
  }
}
