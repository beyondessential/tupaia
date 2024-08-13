/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { sendEmail } from '@tupaia/server-utils';
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

    for (const task of overdueTasks) {
      const assignee = await user.findById(task.assignee_id);

      await sendEmail(assignee.email, {
        subject: 'Task overdue on Tupaia.org',
        templateName: 'overdueTask',
        templateContext: {
          userName: user.fullName,
          surveyName: task.survey_name,
          entityName: task.entity_name,
          dueDate: new Date(task.due_date).toLocaleDateString(),
        },
      });
    }
  }
}
