/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebTasksRequest, Task } from '@tupaia/types';
import { RECORDS } from '@tupaia/database';
import { DatatrakWebServerModelRegistry } from '../types';

export type TasksRequest = Request<
  DatatrakWebTasksRequest.Params,
  DatatrakWebTasksRequest.ResBody,
  DatatrakWebTasksRequest.ReqBody,
  DatatrakWebTasksRequest.ReqQuery
>;

const FIELDS = [
  'id',
  'survey.name',
  'survey.code',
  'entity.country_code',
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
  'survey.code': string;
  'entity.name': string;
  'entity.country_code': string;
};

const queryForCount = (filters: Record<string, any>, models: DatatrakWebServerModelRegistry) => {
  const { assigneeId } = filters;

  const multiJoin = [
    {
      joinWith: RECORDS.ENTITY,
      joinCondition: [`${RECORDS.ENTITY}.id`, `${RECORDS.TASK}.entity_id`],
    },
    {
      joinWith: RECORDS.SURVEY,
      joinCondition: [`${RECORDS.SURVEY}.id`, `${RECORDS.TASK}.survey_id`],
    },
  ];

  if (assigneeId) {
    multiJoin.push({
      joinWith: RECORDS.USER_ACCOUNT,
      joinCondition: [`${RECORDS.USER_ACCOUNT}.id`, `${RECORDS.TASK}.assignee_id`],
    });
  }
  return models.database.count(RECORDS.TASK, filters, {
    multiJoin,
  });
};

export class TasksRoute extends Route<TasksRequest> {
  public async buildResponse() {
    const { ctx, query = {}, models } = this.req;
    const { filter = {}, pageSize = DEFAULT_PAGE_SIZE, sort, page = 0 } = query;

    const tasks = await ctx.services.central.fetchResources('tasks', {
      filter,
      columns: FIELDS,
      sort,
      pageSize,
      page,
    });

    // Get all task ids for pagination
    const count = await queryForCount(filter, models);

    const numberOfPages = Math.ceil(count / pageSize);

    const formattedTasks = tasks.map((task: SingleTask) => {
      const {
        assignee_id: assigneeId,
        'user_account.first_name': firstName,
        'user_account.last_name': lastName,
        entity_id: entityId,
        'entity.name': entityName,
        'entity.country_code': entityCountryCode,
        'survey.code': surveyCode,
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
          countryCode: entityCountryCode,
        },
        survey: {
          id: surveyId,
          name: surveyName,
          code: surveyCode,
        },
      };
    });

    return {
      tasks: camelcaseKeys(formattedTasks, { deep: true }),
      count,
      numberOfPages,
    };
  }
}
