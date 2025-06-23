import { sub } from 'date-fns';
import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebTasksRequest, TaskCommentType } from '@tupaia/types';

import { TaskT, formatTaskResponse } from '../utils';

export interface TasksRequest
  extends Request<
    DatatrakWebTasksRequest.Params,
    DatatrakWebTasksRequest.ResBody,
    DatatrakWebTasksRequest.ReqBody,
    DatatrakWebTasksRequest.ReqQuery
  > {}

const FIELDS = [
  'id',
  'survey.name',
  'survey.code',
  'entity.country_code',
  'entity.name',
  'entity.code',
  'assignee_name',
  'assignee_id',
  'task_status',
  'task_due_date',
  'repeat_schedule',
  'survey_id',
  'entity_id',
  'initial_request_id',
];

const DEFAULT_PAGE_SIZE = 20;

interface FormattedFilters {
  [key: string]:
    | string
    | {
        comparator: string;
        comparisonValue: unknown;
      };
}

const EQUALITY_FILTERS = ['assignee_id', 'survey.project_id', 'task_status'];

export class TasksRoute extends Route<TasksRequest> {
  private filters: FormattedFilters = {};
  private formatFilters() {
    const { filters = [] } = this.req.query;

    for (const { id, value } of filters) {
      if (value === '' || value === undefined || value === null) continue;

      if (id === 'due_date') {
        // set the time to the end of the day to get the full range of the day, and apply milliseconds to ensure the range is inclusive
        const end = new Date(value);
        // subtract 23 hours, 59 minutes, 59 seconds to get the start of the day. This is because the filters always send the end of the day, and we need a range to handle the values being saved in the database as unix timestamps based on the user's timezone.
        const start = sub(end, { hours: 23, minutes: 59, seconds: 59 });
        this.filters[id] = {
          comparator: 'BETWEEN',
          comparisonValue: [start.getTime(), end.getTime()],
        };
        continue;
      }

      if (EQUALITY_FILTERS.includes(id)) {
        this.filters[id] = value;
        continue;
      }

      if (id === 'repeat_schedule') {
        this.filters['repeat_schedule->freq'] = value;
        continue;
      }

      this.filters[id] = {
        comparator: 'ilike',
        comparisonValue: `${value}%`,
      };
    }
  }

  private async queryForCount() {
    const { models, accessPolicy } = this.req;
    const filtersWithColumnSelectors = { ...this.filters };

    // use column selectors for custom columns being used in filters
    for (const [key, value] of Object.entries(this.filters)) {
      if (key in models.task.customColumnSelectors) {
        const colKey =
          models.task.customColumnSelectors[
            key as keyof typeof models.task.customColumnSelectors
          ]();
        filtersWithColumnSelectors[colKey] = value;
        delete filtersWithColumnSelectors[key];
      }
    }

    return models.task.countTasksForAccessPolicy(accessPolicy, filtersWithColumnSelectors, {
      multiJoin: models.task.DatabaseRecordClass.joins,
    });
  }

  public async buildResponse() {
    const {
      ctx,
      query: { pageSize = DEFAULT_PAGE_SIZE, sort, page = 0, filters },
      models,
    } = this.req;

    this.formatFilters();

    const nonProjectFilters = filters?.filter(({ id }) => id !== 'survey.project_id') ?? [];

    const params: {
      filter: FormattedFilters;
      columns: string[];
      pageSize: number;
      page: number;
      sort?: string[];
      rawSort?: string;
    } = {
      filter: this.filters,
      columns: FIELDS,
      pageSize,
      page,
    };
    if (sort) {
      params.sort = sort;
    } else if (!sort && nonProjectFilters.length === 0) {
      // If no sort or search is provided, default to sorting completed and cancelled tasks to the bottom and by due date
      params.rawSort =
        "CASE status WHEN 'completed' THEN 1 WHEN 'cancelled' THEN 2 ELSE 0 END ASC, due_date ASC";
    } else {
      params.rawSort = 'due_date ASC';
    }

    const _tasks = await ctx.services.central.fetchResources('tasks', params);
    const tasks = (await Promise.all(
      _tasks.map(async (task: TaskT) => {
        const [formattedTask, commentsCount] = await Promise.all([
          formatTaskResponse(models, task),
          models.taskComment.count({
            task_id: task.id,
            type: TaskCommentType.user,
          }),
        ]);

        return {
          ...formattedTask,
          commentsCount,
        };
      }),
    )) as DatatrakWebTasksRequest.ResBody['tasks'];

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
