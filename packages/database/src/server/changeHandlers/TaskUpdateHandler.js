import { ChangeHandler } from './ChangeHandler';

/**
 * Handles updating a task entity_id when a survey response is updated with a new entity_id
 */
export class TaskUpdateHandler extends ChangeHandler {
  constructor(models) {
    super(models, 'task-update-handler');

    this.changeTranslators = {
      surveyResponse: change => this.getUpdatedSurveyResponses(change),
    };
  }

  /**
   * @private
   * Only get the new survey responses that are created, as we only want to create new tasks when a survey response is created, not when it is updated
   */
  getUpdatedSurveyResponses(changeDetails) {
    const { type, new_record: newRecord, old_record: oldRecord } = changeDetails;

    // if the change is not a create, we don't need to do anything. This is because once a task is marked as complete, it will never be undone
    if (
      type !== 'update' ||
      !oldRecord ||
      oldRecord.entity_id === newRecord.entity_id ||
      newRecord.outdated === true
    ) {
      return [];
    }
    return [newRecord];
  }

  async handleChanges(models, changedResponses) {
    // if there are no changed responses, we don't need to do anything
    if (changedResponses.length === 0) return;

    for (const response of changedResponses) {
      const sr = await models.surveyResponse.findById(response.id);
      const { entity_id: entityId, id } = sr;

      const task = await models.task.findOne({ initial_request_id: id });

      // if there is no task, entity is the same as on the task, or the task is already completed, we don't need to do anything
      if (!task || task.entity_id === entityId || task.status === 'completed') {
        continue;
      }

      // update the task with the new entity_id
      await models.task.updateById(task.id, { entity_id: entityId });
    }
  }
}
