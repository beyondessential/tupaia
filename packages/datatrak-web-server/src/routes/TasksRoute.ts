/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebTasksRequest, Task } from '@tupaia/types';

export type TasksRequest = Request<
  DatatrakWebTasksRequest.Params,
  DatatrakWebTasksRequest.ResBody,
  DatatrakWebTasksRequest.ReqBody,
  DatatrakWebTasksRequest.ReqQuery
>;

const FIELDS = [
  'survey.name',
  'entity.name',
  'user_account.first_name',
  'user_account.last_name',
  'assignee_id',
  'status',
  'due_date',
  'is_recurring',
  'repeat_frequency',
  'survey_id',
  'entity_id',
];

const DEFAULT_PAGE_SIZE = 20;

type SingleTask = Task & {
  'user_account.first_name'?: string;
  'user_account.last_name'?: string;
  'survey.name': string;
  'entity.name': string;
};

export class TasksRoute extends Route<TasksRequest> {
  public async buildResponse() {
    const { ctx, query = {} } = this.req;
    const { filter = {}, pageSize = DEFAULT_PAGE_SIZE, sort, page = 0 } = query;

    const tasks = await ctx.services.central.fetchResources('tasks', {
      filter,
      columns: FIELDS,
      sort,
      pageSize,
      page,
    });

    const formattedTasks = tasks.map((task: SingleTask) => {
      const {
        assignee_id: assigneeId,
        'user_account.first_name': firstName,
        'user_account.last_name': lastName,
        entity_id: entityId,
        'entity.name': entityName,
        survey_id: surveyId,
        'survey.name': surveyName,
        ...rest
      } = task;
      return {
        ...rest,
        assignee: assigneeId
          ? {
              id: assigneeId,
              name: `${firstName} ${lastName}`,
            }
          : null,
        entity: {
          id: entityId,
          name: entityName,
        },
        survey: {
          id: surveyId,
          name: surveyName,
        },
      };
    });

    return camelcaseKeys(formattedTasks, {
      deep: true,
    });
  }
}
