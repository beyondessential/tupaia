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

const queryForCount = (filter: Record<string, any>, models: DatatrakWebServerModelRegistry) => {
  const {
    'user_account.first_name': assigneeFirstName,
    'user_account.last_name': assigneeLastName,
  } = filter;

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

  if (assigneeFirstName || assigneeLastName) {
    multiJoin.push({
      joinWith: RECORDS.USER_ACCOUNT,
      joinCondition: [`${RECORDS.USER_ACCOUNT}.id`, `${RECORDS.TASK}.assignee_id`],
    });
  }
  return models.database.count(RECORDS.TASK, filter, {
    multiJoin,
  });
};

// the names are formatted as "firstName lastName" so we need to split the string and format the filters accordingly
const formatFirstNameFilter = (nameString: string) => {
  const [strPart1, strPart2] = nameString.split(' ');

  // if there is only one part of the name, return a starting with filter for the first name
  if (!strPart2)
    return {
      [`${RECORDS.USER_ACCOUNT}.first_name`]: {
        comparator: 'ilike',
        comparisonValue: `${strPart1}%`,
      },
    };

  // if there are two parts of the name, return an exact filter for the first name and a starting with filter for the last name
  return {
    [`${RECORDS.USER_ACCOUNT}.first_name`]: strPart1,
    [`${RECORDS.USER_ACCOUNT}.last_name`]: {
      comparator: 'ilike',
      comparisonValue: `${strPart2}%`,
    },
  };
};

const formatFilters = (filters: Record<string, any>[]) => {
  return filters.reduce((acc, { id, value }) => {
    if (value === '' || value === undefined || value === null) return acc;
    if (id === 'assignee.name') {
      return {
        ...acc,
        ...formatFirstNameFilter(value),
      };
    }
    if (value) {
      acc[id] = {
        comparator: 'ilike',
        comparisonValue: value,
      };
    }
    return acc;
  }, {});
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
