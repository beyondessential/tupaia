/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Country, DatatrakWebTasksRequest, Entity, Survey, Task, TaskStatus } from '@tupaia/types';
import camelcaseKeys from 'camelcase-keys';

export type TaskT = Omit<Task, 'created_at'> & {
  'entity.name': Entity['name'];
  'entity.parent_name': Entity['name'];
  'entity.country_code': Country['code'];
  'survey.code': Survey['code'];
  'survey.name': Survey['name'];
  task_status: TaskStatus | 'overdue' | 'repeating';
  repeat_schedule?: Record<string, unknown> | null;
  task_due_date: Date | null;
};

type FormattedTask = DatatrakWebTasksRequest.TaskResponse;

export const formatTaskResponse = (task: TaskT): FormattedTask => {
  const {
    entity_id: entityId,
    'entity.name': entityName,
    'entity.parent_name': entityParentName,
    'entity.country_code': entityCountryCode,
    'survey.code': surveyCode,
    survey_id: surveyId,
    'survey.name': surveyName,
    task_status: taskStatus,
    repeat_schedule: repeatSchedule,
    ...rest
  } = task;

  const formattedTask = {
    ...rest,
    entity: {
      id: entityId,
      name: entityName,
      countryCode: entityCountryCode,
      parentName: entityParentName,
    },
    survey: {
      id: surveyId,
      name: surveyName,
      code: surveyCode,
    },
    taskStatus,
    repeatSchedule,
  };

  return camelcaseKeys(formattedTask, {
    deep: true,
  });
};
