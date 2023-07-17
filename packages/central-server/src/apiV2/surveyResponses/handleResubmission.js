/* eslint-disable camelcase */
/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { findQuestionsInSurvey } from '../../dataAccessors';

export const getSurveyIdFromResponse = async (models, recordId) => {
  const currentSurveyResponse = await models.surveyResponse.findOne({ id: recordId });
  return currentSurveyResponse.survey_id;
};

export const handleSurveyResponse = async (models, updatedFields, recordType, recordId) => {
  const surveyResponseUpdateFields = { ...updatedFields };
  delete surveyResponseUpdateFields.answers;
  if (Object.keys(surveyResponseUpdateFields).length < 1) {
    return;
  }
  await models.getModelForDatabaseType(recordType).updateById(recordId, surveyResponseUpdateFields);
};

export const handleAnswers = async (models, updatedAnswers, recordId) => {
  if (!updatedAnswers) {
    return;
  }
  // check answer exists
  const surveyId = await getSurveyIdFromResponse(models, recordId);
  const surveyQuestions = await findQuestionsInSurvey(models, surveyId);
  const codesToIds = {};
  surveyQuestions.forEach(({ id, code, type }) => {
    codesToIds[code] = { id, type };
  });
  const questionCodes = Object.keys(updatedAnswers);

  await Promise.all(
    questionCodes.map(async questionCode => {
      const isEmptyAnswer = updatedAnswers[questionCode].trim() === '';
      const { id, type } = codesToIds[questionCode];
      const existingAnswer = await models.answer.findOne({
        survey_response_id: recordId,
        question_id: id,
      });

      if (!existingAnswer) {
        if (isEmptyAnswer) {
          // assumes a new answer with an empty string should not be recorded.
          return;
        }
        await models.answer.create({
          type,
          survey_response_id: recordId,
          question_id: id,
          text: updatedAnswers[questionCode],
        });
        return;
      }

      if (isEmptyAnswer) {
        // assumes that an empty string for an existing field means delete.
        await models.answer.delete({ id: existingAnswer.id });
        return;
      }

      await models.answer.update(
        { id: existingAnswer.id },
        {
          text: updatedAnswers[questionCode],
        },
      );
    }),
  );
};
