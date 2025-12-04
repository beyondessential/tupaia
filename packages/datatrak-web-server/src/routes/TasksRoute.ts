import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebTasksRequest } from '@tupaia/types';
import { formatFilters } from '@tupaia/tsutils';
import { TASKS_QUERY_FIELDS } from '@tupaia/constants';

export interface TasksRequest
  extends Request<
    DatatrakWebTasksRequest.Params,
    DatatrakWebTasksRequest.ResBody,
    DatatrakWebTasksRequest.ReqBody,
    DatatrakWebTasksRequest.ReqQuery
  > {}

const DEFAULT_PAGE_SIZE = 20;

interface FormattedFilters {
  [key: string]:
    | string
    | {
        comparator: string;
        comparisonValue: unknown;
      };
}

export class TasksRoute extends Route<TasksRequest> {
  private filters: FormattedFilters = {};

  private async queryForCount() {
    const { models, accessPolicy } = this.req;
    return models.task.countTasksForAccessPolicy(accessPolicy, this.filters, {
      multiJoin: models.task.DatabaseRecordClass.joins,
    });
  }

  public async buildResponse() {
    const {
      ctx,
      query: { pageSize = DEFAULT_PAGE_SIZE, sort, page = 0, filters },
      models,
    } = this.req;

    this.filters = formatFilters(filters ?? []) as FormattedFilters;

    const params: {
      filter: FormattedFilters;
      columns: string[];
      pageSize: number;
      page: number;
      sort?: string[];
      rawSort?: string;
    } = {
      filter: this.filters,
      columns: TASKS_QUERY_FIELDS,
      pageSize,
      page,
    };
    if (sort) {
      params.sort = sort;
    } else {
      const nonProjectFilters = filters?.filter(({ id }) => id !== 'survey.project_id') ?? [];
      const hasActiveFilter = nonProjectFilters.length > 0;
      // If no sort or search is provided, default to sorting completed and cancelled tasks to the bottom and by due date
      params.rawSort = hasActiveFilter
        ? `due_date ASC`
        : `CASE status WHEN 'completed' THEN 1 WHEN 'cancelled' THEN 2 ELSE 0 END ASC, due_date ASC`;
    }

    const _tasks = await ctx.services.central.fetchResources('tasks', params);
    const tasks = await models.task.formatTasksWithComments(_tasks);

    // Get all task ids for pagination
    const count = await this.queryForCount();
    const numberOfPages = Math.ceil(count / pageSize);

    return {
      tasks,
      count,
      numberOfPages,
    };
  }
}
