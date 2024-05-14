/* eslint-disable camelcase */
/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { QuestionType } from '@tupaia/types';
import { findQuestionsInSurvey } from '../../../dataAccessors';
import { S3, S3Client } from '@tupaia/server-utils';
import { UploadError } from '@tupaia/utils';

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
      const answer = updatedAnswers[questionCode];
      const isAnswerDeletion = updatedAnswers[questionCode] === null;
      const { id, type } = codesToIds[questionCode];
      const existingAnswer = await models.answer.findOne({
        survey_response_id: surveyResponseId,
        question_id: id,
      });

      // If the answer is a photo and the answer is updated and the value is a base64 encoded image, upload the image to S3 and update the answer to be the url
      const validFileIdRegex = RegExp('^[a-f\\d]{24}$');
      if (type === QuestionType.Photo && answer && !validFileIdRegex.test(answer)) {
        try {
          const base64 = updatedAnswers[questionCode];
          const s3Client = new S3Client(new S3());
          updatedAnswers[questionCode] = await s3Client.uploadImage(base64);
        } catch (error) {
          throw new UploadError(error);
        }
      }

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
