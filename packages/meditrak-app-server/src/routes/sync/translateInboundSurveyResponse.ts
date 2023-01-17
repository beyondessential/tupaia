/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import * as cloneDeep from 'lodash.clonedeep';
import { EntityModel, QuestionModel, SurveyModel } from '@tupaia/database';
import { UserModel } from '@tupaia/server-boilerplate';
import { ValidationError } from '@tupaia/utils';
import { MeditrakAppServerModelRegistry } from '../../types';

/**
 * { user_email: "user@beyondessential.com.au" } => { user_id: "5fbb27d061f76a22920130a1", assessor_name: "User One" }
 */
const translateUserEmailToIdAndAssessorName = async (userModel: UserModel, email: string) => {
  const user = await userModel.findOne({ email });
  return { user_id: user.id, assessor_name: user.fullName };
};

/**
 * { entity_code: "TO" } => { entity_id: "5d3f884471bb2e31bfacae23" }
 */
const translateEntityCodeToId = async (entityModel: EntityModel, code: string) => {
  const entity = await entityModel.findOne({ code });
  return { entity_id: entity.id };
};

/**
 * { survey_code: "PSSS_Confirmed_WNR" } => { entity_id: "5fb5ff5b61f76a7cdf06233f" }
 */
const translateSurveyCodeToId = async (surveyModel: SurveyModel, code: string) => {
  const survey = await surveyModel.findOne({ code });
  return { survey_id: survey.id };
};

/**
 * { question_code: "RHS1UNFPA68" } => { question_id: "5e01604261f76a4835c6600c" }
 */
export const translateQuestionCodeToId = async (questionModel: QuestionModel, code: string) => {
  const question = await questionModel.findOne({ code });
  return { question_id: question.id };
};

const constructSurveyResponseTranslators = (models: MeditrakAppServerModelRegistry) => ({
  user_email: (userEmail: string) => translateUserEmailToIdAndAssessorName(models.user, userEmail),
  entity_code: (entityCode: string) => translateEntityCodeToId(models.entity, entityCode),
  survey_code: (surveyCode: string) => translateSurveyCodeToId(models.survey, surveyCode),
  answers: (answers: { body: string }[]) => ({ answers: answers.filter(a => a.body !== '') }), // remove any empty answers
});

const constructAnswerTranslators = (models: MeditrakAppServerModelRegistry) => ({
  question_code: (questionCode: string) => translateQuestionCodeToId(models.question, questionCode),
});

type Translator<T> = {
  [key in keyof T]?: (fieldValue: unknown) => Promise<Record<string, unknown>>;
};

const translateObjectFields = async <T extends Record<string, unknown>>(
  object: T,
  objectTranslators: Translator<T>,
) => {
  await Promise.all(
    Object.entries(object).map(async ([field, value]) => {
      const translator = objectTranslators[field as keyof typeof object];
      if (translator) {
        const newFields = await translator(value);
        // eslint-disable-next-line no-param-reassign
        delete object[field as keyof typeof object];
        Object.entries(newFields).forEach(([newField, newValue]) => {
          // eslint-disable-next-line no-param-reassign
          object[newField as keyof T] = newValue;
        });
      }
    }),
  );
};

const requiresSurveyResponseTranslation = (
  surveyResponseObject: Record<string, unknown>,
  surveyResponseTranslators: ReturnType<typeof constructSurveyResponseTranslators>,
  answerTranslators: ReturnType<typeof constructAnswerTranslators>,
) => {
  const surveyResponseTranslatorFields = Object.keys(surveyResponseTranslators);
  if (
    Object.keys(surveyResponseObject).some(field => surveyResponseTranslatorFields.includes(field))
  ) {
    return true;
  }

  const answerTranslatorFields = Object.keys(answerTranslators);
  const { answers } = surveyResponseObject;
  if (Array.isArray(answers)) {
    return answers.some(
      answer =>
        answer.body === '' ||
        Object.keys(answer).some(field => answerTranslatorFields.includes(field)),
    );
  }

  return false;
};

export async function translateSurveyResponseObject(
  models: MeditrakAppServerModelRegistry,
  surveyResponseObject?: Record<string, unknown>,
) {
  if (!surveyResponseObject) {
    throw new ValidationError('Payload must contain survey_response_object');
  }

  const surveyResponseTranslators = constructSurveyResponseTranslators(models);
  const answerTranslators = constructAnswerTranslators(models);

  if (
    !requiresSurveyResponseTranslation(
      surveyResponseObject,
      surveyResponseTranslators,
      answerTranslators,
    )
  ) {
    return surveyResponseObject;
  }

  const translatedSurveyResponseObject = cloneDeep(surveyResponseObject);
  await translateObjectFields(translatedSurveyResponseObject, surveyResponseTranslators);

  const { answers } = translatedSurveyResponseObject;
  if (Array.isArray(answers)) {
    for (let i = 0; i < answers.length; i++) {
      await translateObjectFields(answers[i], answerTranslators);
    }
  }

  return translatedSurveyResponseObject;
}
