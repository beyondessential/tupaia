/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { sendEmail } from '@tupaia/server-utils';
import { format } from 'date-fns';
import winston from 'winston';
import { ScheduledTask } from './ScheduledTask';

export class TaskOverdueChecker extends ScheduledTask {
  constructor(models) {
    // run TaskOverdueChecker every hour
    super(models, 'TaskOverdueChecker', '0 * * * *');
  }

  async run() {
    const { task, user } = this.models;
    const overdueTasks = await task.find({
      task_status: 'overdue',
      overdue_email_sent: null,
    });

    winston.info(`Found ${overdueTasks.length} overdue task(s)`);

    for (const task of overdueTasks) {
      const assignee = await user.findById(task.assignee_id);

      const result = await sendEmail(assignee.email, {
        subject: 'Task overdue on Tupaia.org',
        templateName: 'overdueTask',
        templateContext: {
          userName: assignee.first_name,
          surveyName: task.survey_name,
          entityName: task.entity_name,
          dueDate: format(new Date(task.due_date), 'do MMMM yyyy'),
        },
      });

      winston.info(`Email sent to ${assignee.email} with status: ${result.response}`);

      task.overdue_email_sent = new Date();
      await task.save();
    }
  }
}