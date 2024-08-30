/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { getOffsetForTimezone } from '@tupaia/utils';
import { DatatrakWebTaskMetricsRequest, TaskStatus } from '@tupaia/types';
import { QUERY_CONJUNCTIONS, RECORDS } from '@tupaia/database';

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
    const baseQuery = { 'survey.project_id': projectId };
    const baseJoin = { joinWith: RECORDS.SURVEY, joinCondition: ['survey.id', 'task.survey_id'] };

    const unassignedTasks = await models.task.count(
      {
        ...baseQuery,
        status: {
          comparator: 'NOT IN',
          comparisonValue: [TaskStatus.completed, TaskStatus.cancelled],
        },
        assignee_id: {
          comparator: 'IS',
          comparisonValue: null,
        },
      },
      baseJoin,
    );

    const overdueTasks = await models.task.count(
      {
        ...baseQuery,
        status: {
          comparator: 'NOT IN',
          comparisonValue: [TaskStatus.completed, TaskStatus.cancelled],
        },
        due_date: {
          comparator: '<=',
          comparisonValue: new Date().getTime(),
        },
      },
      baseJoin,
    );

    const completedTasks = await models.task.find(
      // @ts-ignore
      {
        ...baseQuery,
        status: TaskStatus.completed,
        repeat_schedule: {
          comparator: 'IS',
          comparisonValue: null,
        },
      },
      {
        columns: ['due_date', 'data_time', 'timezone', 'project_id'],
      },
    );

    const onTimeCompletedTasks = completedTasks.filter(record => {
      if (!record.due_date || !record.data_time) {
        return false;
      }
      const { data_time: dataTime, timezone } = record;
      const offset = getOffsetForTimezone(timezone, new Date(dataTime));
      const formattedDate = `${dataTime.toString().replace(' ', 'T')}${offset}`;
      return new Date(formattedDate).getTime() <= record.due_date;
    });

    const onTimeCompletionRate = (onTimeCompletedTasks.length / completedTasks.length) * 100 || 0;

    return {
      unassignedTasks,
      overdueTasks,
      onTimeCompletionRate,
    };
  }
}
