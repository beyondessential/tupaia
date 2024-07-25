/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import keyBy from 'lodash.keyby';
import { ChangeHandler } from './ChangeHandler';

const getAnswerWrapper = (config, questions, answers) => {
  const answersByQuestionId = keyBy(answers, 'question_id');
  const questionsByCode = keyBy(questions, 'code');

  return questionKey => {
    const questionCode = config[questionKey];

    if (questionCode in questionsByCode) {
      const question = questionsByCode[questionCode];
      const answer = answersByQuestionId[question?.id];
      return answer?.text;
    }
    return questionCode;
  };
};

const getSurveyCode = async (models, config) => {
  const surveyCode = config.surveyCode;
  const survey = await models.survey.findOne({ code: surveyCode });
  return survey.id;
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
      const sr = await models.surveyResponse.findById(response.id);
      const questions = await sr.getQuestions();

      const taskQuestion = questions.find(question => question.type === 'Task');
      if (!taskQuestion) {
        continue;
      }

      const answers = await sr.getAnswers();
      const getAnswer = getAnswerWrapper(taskQuestion.config, questions, answers);

      if (getAnswer('shouldCreateTask') === false) {
        continue;
      }

      const surveyId = await getSurveyCode(models, taskQuestion.config);

      const diditwork = await models.task.create({
        survey_id: surveyId,
        entity_id: getAnswer('entityId'),
        assignee_id: getAnswer('assignee'),
        due_date: getAnswer('dueDate'),
        status: 'to_do',
        survey_response_id: response.id,
      });
    }
  }
}
