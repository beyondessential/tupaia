/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { DatatrakWebServerModelRegistry } from '../../types';
import { MeditrakSurveyResponseRequest } from '@tupaia/types';

export const handleTaskCompletion = async (
  models: DatatrakWebServerModelRegistry,
  surveyResponse: MeditrakSurveyResponseRequest,
) => {
  const {
    id: surveyResponseId,
    survey_id: surveyId,
    entity_id: entityId,
    data_time: dataTime,
    user_id: userId,
  } = surveyResponse;
  const tasksToComplete = await models.task.find(
    // @ts-ignore - TS doesn't like the nested query
    {
      [QUERY_CONJUNCTIONS.AND]: {
        status: 'to_do',
        [QUERY_CONJUNCTIONS.OR]: {
          status: {
            comparator: 'IS',
            comparisonValue: null,
          },
        },
      },
      [QUERY_CONJUNCTIONS.RAW]: {
        sql: `(task.survey_id = ? AND task.entity_id = ? AND task.created_at <= ?)`,
        parameters: [surveyId, entityId, dataTime],
      },
    },
  );

  // If the survey response was successfully created, complete any tasks that are due
  if (tasksToComplete.length === 0) return;

  for (const task of tasksToComplete) {
    await task.handleCompletion(surveyResponseId!, userId!);
  }
};
