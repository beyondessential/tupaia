/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { ChangeHandler } from './ChangeHandler';

const getAnswerWrapper = (config, answers) => {
  return code => {
    const questionCode = config[code];
    console.log('questionCode', questionCode);
    const test = answers.find(answer => answer.text.questionCode === questionCode)?.text;
    console.log('test', test);
    return test;
  };
};

export class TaskCreationHandler extends ChangeHandler {
  constructor(models) {
    super(models, 'task-creation-handler');

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

    // if the change is not a create, we don't need to do anything. This is because once a task is marked as complete, it will never be undone
    if (type !== 'update' || !!oldRecord) {
      return [];
    }
    return [newRecord];
  }

  async handleChanges(models, changedResponses) {
    // if there are no changed responses, we don't need to do anything
    if (changedResponses.length === 0) return;

    for (const response of changedResponses) {
      try {
        console.log('response', response);
        const questions = await models.database.executeSql(
          `
       SELECT q.type, ssc.config FROM question q
       JOIN survey_screen_component ssc ON ssc.question_id  = q.id
       JOIN survey_screen ss ON ss.id = ssc.screen_id
       WHERE ss.survey_id = ?
     `,
          [response.survey_id],
        );
        const taskQuestion = questions.find(question => question.type === 'Task');
        if (!taskQuestion) {
          continue;
        }

        const config = JSON.parse(taskQuestion.config);
        const answers = await models.answer.find({
          survey_response_id: response.id,
        });
        console.log('answers', answers);
        const getAnswer = getAnswerWrapper(config, answers);

        await models.task.create({
          assignee_id: getAnswer('assignee'),
          due_date: getAnswer('dueDate'),
          entity_id: response.entity_id,
          survey_id: response.survey_id,
          status: 'to_do',
          survey_response_id: response.id,
        });
      } catch (error) {
        console.log(error);
      }
    }
  }
}
