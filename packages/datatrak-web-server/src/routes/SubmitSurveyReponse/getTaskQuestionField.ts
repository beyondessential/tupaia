/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { DatatrakWebSubmitSurveyResponseRequest, SurveyScreenComponentConfig } from '@tupaia/types';
type SurveyRequestT = DatatrakWebSubmitSurveyResponseRequest.ReqBody;

export const getShouldCreateTask = (
  config: SurveyScreenComponentConfig,
  questions: SurveyRequestT['questions'],
  answers: SurveyRequestT['answers'],
) => {
  const answer = getTaskQuestionField('shouldCreateTask', config, questions, answers);
  return answer === 'Yes';
};

export const getTaskQuestionField = (
  fieldName: string,
  config: SurveyScreenComponentConfig,
  questions: SurveyRequestT['questions'],
  answers: SurveyRequestT['answers'],
) => {
  // @ts-ignore
  const questionId = config.task[fieldName]?.questionId;
  if (!questionId) {
    return null;
  }
  const question = questions.find(question => question.id === questionId);
  return question?.id ? answers[question.id] : null;
};
