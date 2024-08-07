/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import winston from 'winston';
import { format, parseISO } from 'date-fns';
import { sendEmail } from '@tupaia/server-utils';
import { requireEnv } from '@tupaia/utils';
import { ChangeHandler } from './ChangeHandler';

export class TaskAssigneeEmailer extends ChangeHandler {
  constructor(models) {
    super(models, 'task-assignee-emailer');

    this.changeTranslators = {
      task: change => this.getUpdatedTasks(change),
    };
  }

  getUpdatedTasks(changeDetails) {
    const { type, new_record: newRecord, old_record: oldRecord } = changeDetails;

    // only interested in updates where the assignee has changed
    if (
      type !== 'update' ||
      !newRecord.assignee_id ||
      (oldRecord && oldRecord.assignee_id === newRecord.assignee_id)
    ) {
      return [];
    }

    return [newRecord];
  }

  async handleChanges(models, changedTasks) {
    const start = Date.now();
    // if there are no changed tasks, we don't need to do anything
    if (changedTasks.length === 0) return;

    for (const task of changedTasks) {
      const {
        survey_id: surveyId,
        assignee_id: assigneeId,
        entity_id: entityId,
        due_date: dueDate,
        id,
      } = task;
      const survey = await models.survey.findById(surveyId);
      if (!survey) {
        throw new Error(`Survey with id ${surveyId} not found`);
      }
      const assignee = await models.user.findById(assigneeId);
      if (!assignee) {
        throw new Error(`User with id ${assigneeId} not found`);
      }
      const entity = await models.entity.findById(entityId);
      if (!entity) {
        throw new Error(`Entity with id ${entityId} not found`);
      }

      const datatrakURL = requireEnv('DATATRAK_FRONT_END_URL');

      sendEmail(assignee.email, {
        subject: 'Tupaia DataTrak Task Assigned',
        templateName: 'taskAssigned',
        templateContext: {
          title: 'You have been assigned a new task',
          userName: assignee.first_name,
          entityName: entity.name,
          surveyName: survey.name,
          dueDate: dueDate ? format(new Date(dueDate), 'do MMMM yyyy') : 'No due date',
          cta: {
            url: `${datatrakURL}/tasks/${id}`,
            text: 'View task',
          },
        },
      });
    }
    const end = Date.now();
    winston.info(`Sending assignee emails completed, took: ${end - start}ms`);
  }
}
