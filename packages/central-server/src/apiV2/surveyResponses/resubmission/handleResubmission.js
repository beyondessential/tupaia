/* eslint-disable camelcase */
/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { findQuestionsInSurvey } from '../../../dataAccessors';

export const handleSurveyResponse = async (models, updatedFields, recordType, surveyResponse) => {
  const surveyResponseUpdateFields = { ...updatedFields };
  delete surveyResponseUpdateFields.answers;
  if (Object.keys(surveyResponseUpdateFields).length < 1) {
    return;
  }
  await models.surveyResponse.updateById(surveyResponse.id, surveyResponseUpdateFields);
};

export const handleAnswers = async (models, updatedFields, surveyResponse) => {
  const { answers: updatedAnswers } = updatedFields;

  if (!updatedAnswers) {
    return;
  }
  // check answer exists
  const { survey_id: surveyId, id: surveyResponseId } = surveyResponse;
  const surveyQuestions = await findQuestionsInSurvey(models, surveyId);
  const codesToIds = {};
  surveyQuestions.forEach(({ id, code, type }) => {
    codesToIds[code] = { id, type };
  });
  const questionCodes = Object.keys(updatedAnswers);

  await Promise.all(
    questionCodes.map(async questionCode => {
      const isAnswerDeletion = updatedAnswers[questionCode] === null;
      const { id, type } = codesToIds[questionCode];
      const existingAnswer = await models.answer.findOne({
        survey_response_id: surveyResponseId,
        question_id: id,
      });

      if (!existingAnswer) {
        if (isAnswerDeletion) {
          return;
        }
        await models.answer.create({
          type,
          survey_response_id: surveyResponseId,
          question_id: id,
          text: updatedAnswers[questionCode],
        });
        return;
      }

      if (isAnswerDeletion) {
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
