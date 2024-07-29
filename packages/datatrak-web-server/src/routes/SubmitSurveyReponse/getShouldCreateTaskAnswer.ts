/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { DatatrakWebSubmitSurveyResponseRequest, SurveyScreenComponentConfig } from '@tupaia/types';
type SurveyRequestT = DatatrakWebSubmitSurveyResponseRequest.ReqBody;

export const getShouldCreateTaskAnswer = (
  config: SurveyScreenComponentConfig,
  questions: SurveyRequestT['questions'],
  answers: SurveyRequestT['answers'],
) => {
  const shouldCreateTask = config?.task?.shouldCreateTask;
  if (!shouldCreateTask) {
    return false;
  }

  if (typeof shouldCreateTask === 'boolean' && shouldCreateTask) {
    return true;
  }

  // @ts-ignore
  const question = questions.find(question => question.code === shouldCreateTask);
  if (!question) {
    return false;
  }
  return answers[question.id as string] === 'Yes';
};
