/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { DatatrakWebTaskRequest, Entity, Survey, Task } from '@tupaia/types';
import camelcaseKeys from 'camelcase-keys';

export type TaskT = Omit<Task, 'created_at'> & {
  'entity.name': Entity['name'];
  'entity.country_code': string;
  'survey.code': Survey['code'];
  'survey.name': Survey['name'];
  task_status: DatatrakWebTaskRequest.ResBody['taskStatus'];
  comments?: DatatrakWebTaskRequest.ResBody['comments'];
};

export const formatTaskResponse = (task: TaskT): DatatrakWebTaskRequest.ResBody => {
  const {
    entity_id: entityId,
    'entity.name': entityName,
    'entity.country_code': entityCountryCode,
    'survey.code': surveyCode,
    survey_id: surveyId,
    'survey.name': surveyName,
    task_status: taskStatus,
    ...rest
  } = task;

  const formattedTask = {
    ...rest,
    taskStatus,
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

  return camelcaseKeys(formattedTask, {
    deep: true,
  }) as DatatrakWebTaskRequest.ResBody;
};
