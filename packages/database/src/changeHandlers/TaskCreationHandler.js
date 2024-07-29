/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import keyBy from 'lodash.keyby';
import { ChangeHandler } from './ChangeHandler';

const getAnswerWrapper = (config, answers) => {
  const answersByQuestionId = keyBy(answers, 'question_id');

  return questionKey => {
    const { questionId } = config[questionKey];
    const answer = answersByQuestionId[questionId];
    return answer?.text;
  };
};

const isPrimaryEntityQuestion = (config, questions) => {
  const primaryEntityQuestion = questions.find(question => question.type === 'PrimaryEntity');
  const { questionId } = config['entityId'];
  return primaryEntityQuestion.id === questionId;
};
const getSurveyCode = async (models, config) => {
  const surveyCode = config.surveyCode;
  const survey = await models.survey.findOne({ code: surveyCode });
  return survey.id;
};

const getQuestions = (models, surveyId) => {
  return models.database.executeSql(
    `
        SELECT q.*, ssc.config::json as config
        FROM question q
        JOIN survey_screen_component ssc ON ssc.question_id = q.id
        JOIN survey_screen ss ON ss.id = ssc.screen_id
        WHERE ss.survey_id = ?;
      `,
    [surveyId],
  );
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

    console.log('STARTING TASK CREATION HANDLER');

    for (const response of changedResponses) {
      const sr = await models.surveyResponse.findById(response.id);
      const questions = await getQuestions(models, response.survey_id);

      const taskQuestion = questions.find(question => question.type === 'Task');

      if (!taskQuestion) {
        continue;
      }
      const config = taskQuestion.config.task;
      const answers = await sr.getAnswers();
      // console.log('answers', answers);
      const getAnswer = getAnswerWrapper(config, answers);

      // console.log("getAnswer('shouldCreateTask')", getAnswer('shouldCreateTask'));

      if (getAnswer('shouldCreateTask') === false) {
        continue;
      }

      // PrimaryEntity question is a special case, where the entity_id is saved against the survey
      // response directly rather than the answers
      const entityId = isPrimaryEntityQuestion(config, questions)
        ? response.entity_id
        : getAnswer('entityId');
      const surveyId = await getSurveyCode(models, config);

      await models.task.create({
        survey_id: surveyId,
        entity_id: entityId,
        assignee_id: getAnswer('assignee'),
        due_date: getAnswer('dueDate'),
        status: 'to_do',
        survey_response_id: response.id,
      });
    }
  }
}
