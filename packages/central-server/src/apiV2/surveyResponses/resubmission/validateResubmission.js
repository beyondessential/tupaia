/**
 * Tupaia MediTrak
 * Copyright (c) 2022-2023 Beyond Essential Systems Pty Ltd
 */

import {
  ValidationError,
  ObjectValidator,
  constructRecordExistsWithId,
  constructIsEmptyOr,
  takesDateForm,
  isPlainObject,
  isAString,
} from '@tupaia/utils';
import { constructAnswerValidator } from '../../utilities/constructAnswerValidator';
import { findQuestionsInSurvey } from '../../../dataAccessors';

export const validateResubmission = async (models, updatedFields, surveyResponse) => {
  if (!updatedFields) {
    throw new ValidationError('Survey responses must not be null');
  }

  const surveyResponseValidator = createSurveyResponseValidator(models);
  await surveyResponseValidator.validate(updatedFields);
  const { survey_id: surveyId } = surveyResponse;
  const surveyQuestions = await findQuestionsInSurvey(models, surveyId);

  const { answers } = updatedFields;
  if (!answers) {
    return;
  }

  const answerValidations = Object.entries(answers).map(async ([questionCode, value]) => {
    const question = surveyQuestions.find(q => q.code === questionCode);
    if (!question) {
      throw new ValidationError(
        `Could not find question with code ${questionCode} on survey ${surveyId}`,
      );
    }

    if (value === null || value === undefined) {
      // Answer deleted, valid
      return;
    }

    try {
      const answerValidator = new ObjectValidator({}, constructAnswerValidator(models, question));
      await answerValidator.validate({ answer: value });
    } catch (e) {
      // validator will always complain of field "answer" but in this context it is not
      // particularly useful
      throw new Error(e.message.replace('field "answer"', `question code "${questionCode}"`));
    }
  });

  await Promise.all(answerValidations);
};

const createSurveyResponseValidator = models =>
  new ObjectValidator({
    entity_id: [constructIsEmptyOr(constructRecordExistsWithId(models.entity))],
    data_time: [constructIsEmptyOr(takesDateForm)],
    end_time: [constructIsEmptyOr(takesDateForm)],
    start_time: [constructIsEmptyOr(takesDateForm)],
    answers: [constructIsEmptyOr(isPlainObject)],
    approval_status: [constructIsEmptyOr(isAString)],
  });
