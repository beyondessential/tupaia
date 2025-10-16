import { DatatrakWebTasksRequest } from '@tupaia/types';
import { formatFilters, FormattedFilters } from '@tupaia/tsutils';
import { AccessPolicy } from '@tupaia/access-policy';
import { processColumns, processColumnSelectorKeys, RECORDS } from '@tupaia/database';
import { TASKS_QUERY_FIELDS } from '@tupaia/constants';

import { DatatrakWebModelRegistry } from '../../types';

export const queryForCount = async (
  models: DatatrakWebModelRegistry,
  accessPolicy: AccessPolicy,
  filters: FormattedFilters,
) => {
  return models.task.countTasksForAccessPolicy(accessPolicy, filters, {
    multiJoin: models.task.DatabaseRecordClass.joins,
  });
};

export const getTasks = async ({
  models,
  accessPolicy,
  filters,
  pageSize = 100000,
  page = 0,
  sort,
}: {
  models: DatatrakWebModelRegistry;
  accessPolicy: AccessPolicy;
  filters?: Record<string, string>[];
  pageSize?: number;
  page?: number;
  sort?: string[];
}) => {
  const formattedFilters = formatFilters(filters ?? []);

  const params: {
    filter: FormattedFilters;
    pageSize: number;
    page: number;
    sort?: string[];
    rawSort?: string;
  } = {
    filter: formattedFilters,
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

  const processFilters = processColumnSelectorKeys(models, formattedFilters, RECORDS.TASK);

  // Custom columns only work with models.database.find instead of models.task.find
  const _tasks = (await models.database.find(RECORDS.TASK, processFilters, {
    columns: processColumns(models, TASKS_QUERY_FIELDS, RECORDS.TASK),
    limit: pageSize,
    offset: page * pageSize,
    sort: params.sort,
    rawSort: params.rawSort,
    multiJoin: models.task.DatabaseRecordClass.joins,
  })) as unknown as DatatrakWebTasksRequest.RawTaskResult[];

  const tasks = await models.task.formatTasksWithComments(_tasks);

  // Get all task ids for pagination
  const count = await queryForCount(models, accessPolicy, processFilters);
  const numberOfPages = Math.ceil(count / pageSize);
  return { tasks, count: tasks.length, numberOfPages };
};
