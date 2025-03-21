import { sendEmail } from '@tupaia/server-utils';
import { requireEnv } from '@tupaia/utils';
import winston from 'winston';
import { ScheduledTask } from '@tupaia/server-utils';

export class TaskOverdueChecker extends ScheduledTask {
  constructor(models) {
    // run TaskOverdueChecker every hour
    super(models, 'TaskOverdueChecker', '0 * * * *');
  }

  async run() {
    const { task, user, taskComment } = this.models;
    const overdueTasks = await task.find({
      task_status: 'overdue',
      overdue_email_sent: null,
    });

    winston.info(`Found ${overdueTasks.length} overdue task(s)`);

    for (const overdueTask of overdueTasks) {
      if (!overdueTask.assignee_id) {
        winston.info(`Task ${overdueTask.id} has no assignee`);
        continue;
      }
      const assignee = await user.findById(overdueTask.assignee_id);

      if (!assignee) {
        winston.error(`Assignee with id ${overdueTask.assignee_id} not found`);
        continue;
      }
      const datatrakURL = requireEnv('DATATRAK_FRONT_END_URL');

      const result = await sendEmail(assignee.email, {
        subject: 'Task overdue on Tupaia.org',
        templateName: 'overdueTask',
        templateContext: {
          userName: assignee.first_name,
          surveyName: overdueTask.survey_name,
          entityName: overdueTask.entity_name,
          cta: {
            url: `${datatrakURL}/tasks/${overdueTask.id}`,
            text: 'View task',
          },
        },
      });

      winston.info(`Email sent to ${assignee.email} with status: ${result.response}`);
      await task.updateById(overdueTask.id, { overdue_email_sent: new Date() });
      await overdueTask.addOverdueComment(assignee.id);
    }
  }
}
