import { DatatrakWebTasksRequest } from '@tupaia/types';
import { formatFilters, FormattedFilters } from '@tupaia/tsutils';
import { AccessPolicy } from '@tupaia/access-policy';
import { JOIN_TYPES, RECORDS } from '@tupaia/database';
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

export const fullyQualifyColumnSelector = (unprocessedColumnSelector, baseRecordType) => {
  const [resource, column] = unprocessedColumnSelector.includes('.')
    ? unprocessedColumnSelector.split('.')
    : [baseRecordType, unprocessedColumnSelector];
  return `${resource}.${column}`;
};

export const processColumnSelector = (models, unprocessedColumnSelector, baseRecordType) => {
  const fullyQualifiedSelector = fullyQualifyColumnSelector(
    unprocessedColumnSelector,
    baseRecordType,
  );
  const [recordType, column] = fullyQualifiedSelector.split('.');
  const model = models.getModelForDatabaseRecord(recordType);
  const customSelector = model?.customColumnSelectors?.[column];
  return customSelector ? customSelector(fullyQualifiedSelector) : fullyQualifiedSelector;
};

export const processColumns = (models, unprocessedColumns, recordType) => {
  return unprocessedColumns.map(column => ({
    [column]: processColumnSelector(models, column, recordType),
  }));
};

export const getTasks = async ({
  models,
  accessPolicy,
  filters,
  pageSize = 100000,
  page = 1,
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
    columns: string[];
    pageSize: number;
    page: number;
    sort?: string[];
    rawSort?: string;
  } = {
    filter: formattedFilters,
    pageSize: 100000,
    page: 0,
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

  const _tasks = (await models.database.find(RECORDS.TASK, formattedFilters, {
    columns: processColumns(models, TASKS_QUERY_FIELDS, 'task'),
    limit: pageSize,
    offset: page * pageSize,
    sort: params.sort,
    rawSort: params.rawSort,
    multiJoin: [
      {
        joinWith: RECORDS.ENTITY,
        joinCondition: ['entity_id', `${RECORDS.ENTITY}.id`],
        fields: { code: 'entity_code', name: 'entity_name', country_code: 'entity_country_code' },
      },
      {
        joinWith: RECORDS.USER_ACCOUNT,
        joinAs: 'assignee',
        joinType: JOIN_TYPES.LEFT,
        joinCondition: ['assignee_id', 'assignee.id'],
        fields: { first_name: 'assignee_first_name', last_name: 'assignee_last_name' },
      },
      {
        joinWith: RECORDS.SURVEY,
        joinCondition: ['survey_id', `${RECORDS.SURVEY}.id`],
        fields: { name: 'survey_name', code: 'survey_code', project_id: 'project_id' },
      }
    ]
  })) as unknown as DatatrakWebTasksRequest.RawTaskResult[];

  const tasks = await models.task.formatTasksWithComments(_tasks);

  // Get all task ids for pagination
  const count = await queryForCount(models, accessPolicy, formattedFilters);
  const numberOfPages = Math.ceil(count / pageSize);
  return { tasks, count: tasks.length, numberOfPages };
};
