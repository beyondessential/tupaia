/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebTasksRequest, Task, TaskStatus } from '@tupaia/types';
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
  'assignee_name',
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
  'survey.name': string;
  'survey.code': string;
  'entity.name': string;
  'entity.country_code': string;
};

type FormattedFilter = string | { comparator: string; comparisonValue: string } | TaskStatus;

type FormattedFilters = Record<string, FormattedFilter>;

const queryForCount = (filter: FormattedFilters, models: DatatrakWebServerModelRegistry) => {
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

  return models.database.count(RECORDS.TASK, filter, {
    multiJoin,
  });
};

const getStatusFilter = (value: string) => {
  if (value === 'repeating') return { is_recurring: 'true' };
  if (value === TaskStatus.to_do) return { status: value, is_recurring: 'false' };
  return { status: value };
};

const formatFilters = (filters: Record<string, string>[]) => {
  let formattedFilters: FormattedFilters = {};

  filters.forEach(({ id, value }) => {
    if (value === '' || value === undefined || value === null) return;
    if (id === 'survey.project_id') {
      formattedFilters['survey.project_id'] = value;
      return;
    }

    if (id === 'status') {
      Object.assign(formattedFilters, getStatusFilter(value));
      return;
    }

    formattedFilters[id] = {
      comparator: 'ilike',
      comparisonValue: `${value}%`,
    };
  });

  return formattedFilters;
};
export class TasksRoute extends Route<TasksRequest> {
  public async buildResponse() {
    const { ctx, query = {}, models } = this.req;
    const { filters = [], pageSize = DEFAULT_PAGE_SIZE, sort, page = 0 } = query;

    const formattedFilters = formatFilters(filters);

    const tasks = await ctx.services.central.fetchResources('tasks', {
      filter: formattedFilters,
      columns: FIELDS,
      sort,
      pageSize,
      page,
    });

    // Get all task ids for pagination
    const count = await queryForCount(formattedFilters, models);

    const numberOfPages = Math.ceil(count / pageSize);

    const formattedTasks = tasks.map((task: SingleTask) => {
      const {
        assignee_id: assigneeId,
        assignee_name: assigneeName,
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
              name: assigneeName,
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
