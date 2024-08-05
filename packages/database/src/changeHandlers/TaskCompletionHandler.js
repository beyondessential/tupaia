/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { getUniqueEntries } from '@tupaia/utils';
import { ChangeHandler } from './ChangeHandler';
import { QUERY_CONJUNCTIONS } from '../TupaiaDatabase';

export class TaskCompletionHandler extends ChangeHandler {
  constructor(models) {
    super(models, 'task-completion-handler');

    this.changeTranslators = {
      surveyResponse: change => this.getNewSurveyResponses(change),
    };
  }

  /**
   * @private
   * Only get the new survey responses that are created, as we only want to mark tasks as completed when a survey response is created, not when it is updated
   */
  getNewSurveyResponses(changeDetails) {
    const { type, new_record: newRecord, old_record: oldRecord } = changeDetails;

    // if the change is not a "create", we don't need to do anything. This is because once a task is marked as complete, it will never be undone
    if (type !== 'update' || !!oldRecord) {
      return [];
    }
    return [newRecord];
  }

  /**
   * @private Fetches all tasks that have the same survey_id and entity_id as the survey responses, and have a created_at date that is less than or equal to the data_time of the survey response
   */
  async fetchTasksForSurveyResponses(surveyResponses) {
    const surveyIdAndEntityIdPairs = getUniqueEntries(
      surveyResponses.map(surveyResponse => ({
        surveyId: surveyResponse.survey_id,
        entityId: surveyResponse.entity_id,
        dataTime: surveyResponse.data_time,
      })),
    );

    return this.models.task.find({
      // only fetch tasks that have a status of 'to_do' or null (repeating tasks have a status of null)
      status: 'to_do',
      [QUERY_CONJUNCTIONS.OR]: {
        status: {
          comparator: 'IS',
          comparisonValue: null,
        },
      },
      [QUERY_CONJUNCTIONS.RAW]: {
        sql: `${surveyIdAndEntityIdPairs
          .map(() => `(survey_id = ? AND entity_id = ? AND created_at <= ?)`)
          .join(' OR ')}`,
        parameters: surveyIdAndEntityIdPairs.flatMap(({ surveyId, entityId, dataTime }) => [
          surveyId,
          entityId,
          dataTime,
        ]),
      },
    });
  }

  async handleChanges(transactingModels, changedResponses) {
    // if there are no changed responses, we don't need to do anything
    if (changedResponses.length === 0) return;
    const tasksToComplete = await this.fetchTasksForSurveyResponses(changedResponses);

    // if there are no tasks to complete, we don't need to do anything
    if (tasksToComplete.length === 0) return;

    for (const task of tasksToComplete) {
      const { survey_id: surveyId, entity_id: entityId, created_at: createdAt } = task;
      const matchingSurveyResponse = changedResponses.find(
        surveyResponse =>
          surveyResponse.survey_id === surveyId &&
          surveyResponse.entity_id === entityId &&
          surveyResponse.data_time >= createdAt,
      );

      if (!matchingSurveyResponse) continue;

      await task.handleCompletion(matchingSurveyResponse.id);
      await task.addComment(
        'Completed this task',
        matchingSurveyResponse.user_id,
        transactingModels.taskComment.types.System,
      );
    }
  }
}
