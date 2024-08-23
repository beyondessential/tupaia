/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { getOffsetForTimezone } from '@tupaia/utils';
import { DatatrakWebTaskMetricsRequest, TaskStatus } from '@tupaia/types';
import { JOIN_TYPES, QUERY_CONJUNCTIONS, RECORDS } from '@tupaia/database';
import { assertNewExpression } from '@babel/types';

export type TaskMetricsRequest = Request<
  DatatrakWebTaskMetricsRequest.Params,
  DatatrakWebTaskMetricsRequest.ResBody,
  DatatrakWebTaskMetricsRequest.ReqBody,
  DatatrakWebTaskMetricsRequest.ReqQuery
>;

export class TaskMetricsRoute extends Route<TaskMetricsRequest> {
  public async buildResponse() {
    const { params, models } = this.req;
    const { projectId } = params;

    const unassignedTasks = await models.task.count(
      {
        [QUERY_CONJUNCTIONS.RAW]: {
          sql: `(survey.project_id = ? AND assignee_id IS NULL)`,
          parameters: [projectId],
        },
      },
      { joinWith: RECORDS.SURVEY, joinCondition: ['survey.id', 'task.survey_id'] },
    );

    const overdueTasks = await models.task.count(
      {
        [QUERY_CONJUNCTIONS.RAW]: {
          sql: `(survey.project_id = ? AND due_date <= ?)`,
          parameters: [projectId, new Date().getTime()],
        },
      },
      { joinWith: RECORDS.SURVEY, joinCondition: ['survey.id', 'task.survey_id'] },
    );

    const onTimeCompletionTasks = await models.task.find(
      // @ts-ignore
      {
        [QUERY_CONJUNCTIONS.RAW]: {
          sql: `(survey.project_id = ? AND status = 'completed' AND repeat_schedule IS NULL)`,
          parameters: [projectId],
        },
      },
      {
        columns: ['due_date', 'data_time', 'timezone', 'project_id'],
      },
    );

    const onTimeCompletionRate =
      (onTimeCompletionTasks.length /
        onTimeCompletionTasks.filter(record => {
          if (!record.due_date || !record.data_time) {
            return false;
          }
          const { data_time: dataTime, timezone: timezone } = record;
          const offset = getOffsetForTimezone(timezone, new Date(dataTime));
          const formattedDate = `${dataTime.toString().replace(' ', 'T')}${offset}`;
          return new Date(formattedDate).getTime() <= record.due_date;
        }).length) *
        100 || 0;

    return {
      unassignedTasks: unassignedTasks,
      overdueTasks: overdueTasks,
      onTimeCompletionRate: onTimeCompletionRate,
    };
  }
}
