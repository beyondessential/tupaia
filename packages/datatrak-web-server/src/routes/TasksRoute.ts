/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
// @ts-nocheck
import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';
import { Route } from '@tupaia/server-boilerplate';
import { keyBy } from 'lodash';
import { parse } from 'cookie';
import { DatatrakWebTasksRequest, Task, TaskStatus } from '@tupaia/types';
import { QUERY_CONJUNCTIONS, RECORDS } from '@tupaia/database';
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
  'task_status',
  'due_date',
  'repeat_schedule',
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

const processFilterSettings = (
  filters: Record<string, string>[],
  cookieString: string | string[] | undefined,
  userId: string,
) => {
  if (typeof cookieString !== 'string') return filters;
  const filtersById = keyBy(filters, 'id');

  const cookies = parse(cookieString);

  if (!cookies['all_assignees'] || cookies['all_assignees'] === 'false') {
    // add filter for assignee
    filtersById['assignee_id'] = { id: 'assignee_id', value: userId };
  }

  if (!cookies['all_completed'] || cookies['all_completed'] === 'false') {
    // add filter to remove completed tasks
    filtersById['task_status'] = {
      id: 'task_status',
      value: {
        comparator: 'NOT IN',
        comparisonValue: ['completed'],
      },
    };
  }

  if (!cookies['all_cancelled'] || cookies['all_cancelled'] === 'false') {
    // add filter to remove cancelled tasks
    filtersById['task_status'] = {
      id: 'task_status',
      value: {
        comparator: 'NOT IN',
        comparisonValue: ['cancelled'],
      },
    };
  }

  if (
    (!cookies['all_completed'] || cookies['all_completed'] === 'false') &&
    (!cookies['all_cancelled'] || cookies['all_cancelled'] === 'false')
  ) {
    // add filter to remove completed and cancelled tasks
    filtersById['task_status'] = {
      id: 'task_status',
      value: {
        comparator: '=',
        comparisonValue: 'to_do',
      },
    };
    filtersById[QUERY_CONJUNCTIONS.AND] = {
      task_status: {
        id: 'task_status',
        value: {
          comparator: 'NOT IN',
          comparisonValue: ['completed', 'cancelled'],
        },
      },
    };
  }
  console.log('cookies', cookies);
  const filtersToReturn = Object.values(filtersById);
  console.log('filtersToReturn', filtersToReturn);
  return filtersToReturn;
};

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
    const { ctx, query = {}, models, headers } = this.req;
    const { filters = [], pageSize = DEFAULT_PAGE_SIZE, sort, page = 0 } = query;

    const { id: userId } = await ctx.services.central.getUser();
    console.log('userId', userId);

    const processedFilters = processFilterSettings(filters, headers.cookie, userId);
    console.log('FILTERS', filters);
    const formattedFilters = formatFilters(processedFilters);

    console.log(' --- formattedFilters ---', formattedFilters);

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
