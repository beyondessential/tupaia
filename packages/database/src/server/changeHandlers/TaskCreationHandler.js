import { formatInTimeZone } from 'date-fns-tz';
import { keyBy } from 'es-toolkit/compat';

import { QuestionType } from '@tupaia/types';

import { ChangeHandler } from './ChangeHandler';

const getAnswerWrapper = (config, answers) => {
  const answersByQuestionId = keyBy(answers, 'question_id');
  return questionKey => {
    const questionId = config[questionKey]?.questionId;
    if (!questionId) {
      return null;
    }
    const answer = answersByQuestionId[questionId];
    return answer?.text;
  };
};

const isPrimaryEntityQuestion = (config, questions) => {
  const primaryEntityQuestion = questions.find(q => q.type === QuestionType.PrimaryEntity);
  const { questionId } = config.entityId;
  return primaryEntityQuestion.id === questionId;
};

const getSurveyId = async (models, config) => {
  const { surveyCode } = config;
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

const dateAnswerToTimestamp = (dateStr, tz) => {
  if (!dateStr) return null;

  // Convert the due date to the timezone of the survey response and set the time to the last second
  // of the day
  const dateInTimezone = formatInTimeZone(dateStr, tz, "yyyy-MM-dd'T23:59:59'XXX");
  return new Date(dateInTimezone).getTime();
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
    // if there are no changed responses, we don't need to do anything
    if (changedResponses.length === 0) return;

    for (const response of changedResponses) {
      const [sr, questions] = await Promise.all([
        models.surveyResponse.findById(response.id),
        getQuestions(models, response.survey_id),
      ]);

      const taskQuestions = questions.filter(q => q.type === QuestionType.Task);

      if (taskQuestions.length === 0) continue;

      const answers = await sr.getAnswers();

      for (const taskQuestion of taskQuestions) {
        const config = taskQuestion.config.task;

        if (!config) continue;

        const getAnswer = getAnswerWrapper(config, answers);

        const shouldCreateTask = getAnswer('shouldCreateTask');
        if (!shouldCreateTask || shouldCreateTask === 'No') continue;

        // PrimaryEntity question is a special case, where the entity_id is saved against the survey
        // response directly rather than the answers
        const entityId = isPrimaryEntityQuestion(config, questions)
          ? response.entity_id
          : getAnswer('entityId');
        const surveyId = await getSurveyId(models, config);
        const assigneeId = getAnswer('assignee');
        const _dueDate = getAnswer('dueDate');
        const dueDate = dateAnswerToTimestamp(_dueDate, sr.timezone);

        await models.task.create(
          {
            initial_request_id: response.id,
            survey_id: surveyId,
            entity_id: entityId,
            assignee_id: assigneeId,
            due_date: dueDate,
            status: 'to_do',
          },
          sr.user_id,
        );
      }
    }
  }
}
