/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { sendEmail } from '@tupaia/server-utils';
import { ScheduledTask } from './ScheduledTask';
import { RECORDS } from '@tupaia/database';

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
      console.log('task', task.survey_name, task.entity_name);
      const assignee = await user.findById(task.assignee_id);
      console.log('assigneeEmail', assignee.email);

      await sendEmail('caigertom@gmail.com', {
        subject: 'Task overdue on Tupaia.org',
        templateName: 'overdueTask',
        templateContext: {
          userName: user.fullName,
          surveyName: task.survey_name,
          entityName: task.entity_name,
        },
      });
    }
  }
}
