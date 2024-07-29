/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { DatatrakWebSubmitSurveyResponseRequest, TaskQuestionConfig } from '@tupaia/types';
type SurveyRequestT = DatatrakWebSubmitSurveyResponseRequest.ReqBody;
type ConfigT = Omit<TaskQuestionConfig, 'surveyCode'>;

export const getShouldCreateTask = (
  config: { task: ConfigT },
  questions: SurveyRequestT['questions'],
  answers: SurveyRequestT['answers'],
) => {
  const answer = getTaskQuestionField('shouldCreateTask', config, questions, answers);
  return answer === 'Yes';
};

export const getTaskQuestionField = (
  fieldName: keyof ConfigT,
  config: { task: ConfigT },
  questions: SurveyRequestT['questions'],
  answers: SurveyRequestT['answers'],
) => {
  const test = config.task[fieldName];
  const questionId = config.task[fieldName]?.questionId;
  if (!questionId) {
    return null;
  }
  const question = questions.find(question => question.id === questionId);
  return question?.id ? answers[question.id] : null;
};
