import { ChangeHandler } from './ChangeHandler';

export class TaskCreationHandler extends ChangeHandler {
  constructor(models) {
    super(models, 'task-creation-handler');

    this.changeTranslators = {
      surveyResponse: change => this.getNewSurveyResponses(change),
    };
  }

  /**
   * @private
   * Only get the new survey responses that are created, as we only want to create new tasks when a survey response is created, not when it is updated
   */
  getNewSurveyResponses(changeDetails) {
    const { type, new_record: newRecord, old_record: oldRecord } = changeDetails;

    // if the change is not a create, we don't need to do anything. This is because once a task is marked as complete, it will never be undone
    if (type !== 'update' || !!oldRecord) {
      return [];
    }
    return [newRecord];
  }

  async handleChanges(models, changedResponses) {
    if (changedResponses.length === 0) return;

    for (const response of changedResponses) {
      // findById to pick up timezone / canonical fields that the change payload may not carry.
      // createTasksForSurveyResponse is idempotent on initial_request_id, so if the client
      // (datatrak-web) already created the task in the same transaction as the response, this
      // is a no-op.
      const sr = await models.surveyResponse.findById(response.id);
      if (!sr) continue;
      await models.task.createTasksForSurveyResponse(sr);
    }
  }
}
