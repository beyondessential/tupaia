/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebTaskRequest } from '@tupaia/types';
import { TaskT, formatTaskResponse } from '../utils';
import camelcaseKeys from 'camelcase-keys';

export type TaskRequest = Request<
  DatatrakWebTaskRequest.Params,
  DatatrakWebTaskRequest.ResBody,
  DatatrakWebTaskRequest.ReqBody,
  DatatrakWebTaskRequest.ReqQuery
>;

const FIELDS = [
  'id',
  'survey.name',
  'survey.code',
  'entity.name',
  'entity.country_code',
  'entity.code',
  'assignee_name',
  'assignee_id',
  'task_status',
  'due_date',
  'repeat_schedule',
  'survey_id',
  'entity_id',
  'survey_response_id',
  'initial_request_id',
];

export class TaskRoute extends Route<TaskRequest> {
  public async buildResponse() {
    const { ctx, params, models } = this.req;
    const { taskId } = params;

    const task: TaskT = await ctx.services.central.fetchResources(`tasks/${taskId}`, {
      columns: FIELDS,
    });
    if (!task) {
      throw new Error(`Task with id ${taskId} not found`);
    }

    const comments = await ctx.services.central.fetchResources(`tasks/${taskId}/taskComments`, {
      sort: ['created_at DESC'],
    });

    const { survey_id } = task;

    const { project_id } = await models.survey.findById(survey_id);

    const project = await models.project.findById(project_id);

    if (!project) {
      throw new Error(`Project with id ${project_id} not found`);
    }

    const entity = await models.entity.findById(task.entity_id);

    const entityAncestors = project.entity_hierarchy_id
      ? await entity.getAncestors(project.entity_hierarchy_id, {
          generational_distance: 1,
        })
      : [];

    return {
      ...formatTaskResponse({
        ...task,
        'entity.parent_name': entityAncestors[0]?.name,
      }),
      comments: camelcaseKeys(comments, { deep: true }),
    };
  }
}
