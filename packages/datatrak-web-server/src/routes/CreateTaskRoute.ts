/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebCreateTaskRequest, TaskStatus } from '@tupaia/types';
import { stripTimezoneFromDate } from '@tupaia/utils';

export type CreateTaskRequest = Request<
  DatatrakWebCreateTaskRequest.Params,
  DatatrakWebCreateTaskRequest.ResBody,
  DatatrakWebCreateTaskRequest.ReqBody,
  DatatrakWebCreateTaskRequest.ReqQuery
>;

export class CreateTaskRoute extends Route<CreateTaskRequest> {
  public async buildResponse() {
    const { models, body, ctx } = this.req;

    const { surveyCode, entityId, assigneeId, dueDate, repeatSchedule } = body;

    const survey = await models.survey.findOne({ code: surveyCode });
    if (!survey) {
      throw new Error('Survey not found');
    }

    const taskDetails: {
      survey_id: string;
      entity_id: string;
      assignee_id?: string;
      due_date?: string | null;
      repeat_schedule?: string;
      status?: TaskStatus;
    } = {
      survey_id: survey.id,
      entity_id: entityId,
      assignee_id: assigneeId,
    };

    if (repeatSchedule) {
      // if task is repeating, clear due date
      taskDetails.repeat_schedule = JSON.stringify({
        // TODO: format this correctly when recurring tasks are implemented
        frequency: repeatSchedule,
      });
      taskDetails.due_date = null;
    } else {
      if (!dueDate) {
        throw new Error('Due date is required for non-repeating tasks');
      }

      // apply status and due date only if not a repeating task
      // set due date to end of day
      const endOfDay = new Date(new Date(dueDate).setHours(23, 59, 59, 999));

      // strip timezone from date so that the returned date is always in the user's timezone
      const withoutTimezone = stripTimezoneFromDate(endOfDay);

      taskDetails.due_date = withoutTimezone;

      taskDetails.status = TaskStatus.to_do;
    }

    return ctx.services.central.createResource('tasks', {}, taskDetails);
  }
}
