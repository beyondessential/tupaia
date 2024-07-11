/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebTasksRequest, Task, TaskStatus } from '@tupaia/types';
import { RECORDS } from '@tupaia/database';
import { DatatrakWebServerModelRegistry } from '../types';
import { TaskT, formatTask } from '../utils';

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
  'task_status',
  'due_date',
  'repeat_schedule',
  'survey_id',
  'entity_id',
];

const DEFAULT_PAGE_SIZE = 20;

type FormattedFilter =
  | string
  | { comparator: string; comparisonValue: string; castAs?: string }
  | TaskStatus;

type FormattedFilters = Record<string, FormattedFilter>;

const queryForCount = async (filter: FormattedFilters, models: DatatrakWebServerModelRegistry) => {
  const filtersWithColumnSelectors = { ...filter };

  // use column selectors for custom columns being used in filters
  for (const [key, value] of Object.entries(filter)) {
    if (key in models.task.customColumnSelectors) {
      const colKey =
        models.task.customColumnSelectors[key as keyof typeof models.task.customColumnSelectors]();
      filtersWithColumnSelectors[colKey] = value;
      delete filtersWithColumnSelectors[key];
    }
  }

  return models.database.count(RECORDS.TASK, filtersWithColumnSelectors, {
    multiJoin: models.task.DatabaseRecordClass.joins,
  });
};

const EQUALITY_FILTERS = ['due_date', 'survey.project_id', 'task_status'];

const formatFilters = (filters: Record<string, string>[]) => {
  let formattedFilters: FormattedFilters = {};

  filters.forEach(({ id, value }) => {
    if (value === '' || value === undefined || value === null) return;
    if (EQUALITY_FILTERS.includes(id)) {
      formattedFilters[id] = value;
      return;
    }

    if (id === 'repeat_schedule') {
      formattedFilters[id] = {
        comparator: 'ilike',
        comparisonValue: `${value}%`,
        castAs: 'text',
      };
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

    const formattedTasks = tasks.map((task: TaskT) => formatTask(task));

    return {
      tasks: formattedTasks,
      count,
      numberOfPages,
    };
  }
}
