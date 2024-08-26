/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Country, DatatrakWebTasksRequest, Entity, Survey, Task, TaskStatus } from '@tupaia/types';
import camelcaseKeys from 'camelcase-keys';
import { DatatrakWebServerModelRegistry } from '../types';

export type TaskT = Omit<Task, 'created_at'> & {
  'entity.name': Entity['name'];
  'entity.code': Entity['code'];
  'entity.country_code': Country['code'];
  'survey.code': Survey['code'];
  'survey.name': Survey['name'];
  task_status: TaskStatus | 'overdue' | 'repeating';
  repeat_schedule?: Record<string, unknown> | null;
  task_due_date: Date | null;
  assignee_name?: string | null;
};

type FormattedTask = DatatrakWebTasksRequest.TaskResponse;

export const formatTaskResponse = async (
  models: DatatrakWebServerModelRegistry,
  task: TaskT,
): Promise<FormattedTask> => {
  const {
    entity_id: entityId,
    'entity.name': entityName,
    'entity.code': entityCode,
    'entity.country_code': entityCountryCode,
    'survey.code': surveyCode,
    survey_id: surveyId,
    'survey.name': surveyName,
    task_status: taskStatus,
    repeat_schedule: repeatSchedule,
    assignee_id: assigneeId,
    assignee_name: assigneeName,
    ...rest
  } = task;

  const entity = await models.entity.findById(task.entity_id);

  const { survey_id } = task;

  const { project_id } = await models.survey.findById(survey_id);

  const project = await models.project.findById(project_id);

  const entityAncestors =
    project.entity_hierarchy_id && entity.type !== 'country'
      ? await entity.getAncestors(project.entity_hierarchy_id, {
          generational_distance: 1,
        })
      : [];

  const formattedTask = {
    ...rest,
    assignee: {
      id: assigneeId,
      name: assigneeName,
    },
    entity: {
      id: entityId,
      name: entityName,
      code: entityCode,
      countryCode: entityCountryCode,
      parentName: entityAncestors[0]?.name,
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
