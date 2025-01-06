/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebTaskChangeRequest, TaskStatus } from '@tupaia/types';
import { formatTaskChanges } from '../utils';

export type CreateTaskRequest = Request<
  DatatrakWebTaskChangeRequest.Params,
  DatatrakWebTaskChangeRequest.ResBody,
  DatatrakWebTaskChangeRequest.ReqBody,
  DatatrakWebTaskChangeRequest.ReqQuery
>;

export class CreateTaskRoute extends Route<CreateTaskRequest> {
  public async buildResponse() {
    const { models, body, ctx } = this.req;

    const { survey_code: surveyCode } = body;

    const survey = await models.survey.findOne({ code: surveyCode });
    if (!survey) {
      throw new Error('Survey not found');
    }

    const taskDetails = formatTaskChanges({
      ...body,
      survey_id: survey.id,
    });

    if (taskDetails.due_date) {
      taskDetails.status = TaskStatus.to_do;
    }

    await ctx.services.central.createResource('tasks', {}, taskDetails);

    return {
      message: 'Task created successfully',
    };
  }
}
