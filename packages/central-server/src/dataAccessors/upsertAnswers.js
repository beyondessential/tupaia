/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { QuestionType } from '@tupaia/types';
import { S3Client, S3, getS3ImageFilePath, S3_BUCKET_PATH } from '@tupaia/server-utils';
import { DatabaseError, UploadError } from '@tupaia/utils';

export async function upsertAnswers(models, answers, surveyResponseId) {
  const answerRecords = [];

  for (const answer of answers) {
    const answerDocument = {
      id: answer.id,
      type: answer.type,
      question_id: answer.question_id,
      survey_response_id: surveyResponseId,
    };
    if (answer.type === QuestionType.Photo) {
      const validFileIdRegex = RegExp('^[a-f\\d]{24}$');
      if (validFileIdRegex.test(answer.body)) {
        // if this is passed a valid id in the answer body
        answerDocument.text = `${S3_BUCKET_PATH}${getS3ImageFilePath()}${answer.body}.png`;
      } else {
        // included for backwards compatibility passing base64 strings for images, and for datatrak-web to upload images in answers
        try {
          const s3Client = new S3Client(new S3());
          answerDocument.text = await s3Client.uploadImage(answer.body);
        } catch (error) {
          throw new UploadError(error);
        }
      }
      // if the answer is a file object, upload it to s3 and save the url as the answer. If it's not a file object that means it is just a url to a file, which will be handled by default
    } else if (
      answer.type === QuestionType.File &&
      answer.body?.hasOwnProperty('uniqueFileName') &&
      answer.body?.hasOwnProperty('data')
    ) {
      try {
        const s3Client = new S3Client(new S3());
        answerDocument.text = await s3Client.uploadFile(
          answer.body.uniqueFileName,
          answer.body.data,
        );
      } catch (error) {
        throw new UploadError(error);
      }
    } else {
      answerDocument.text = answer.body;
    }

    try {
      const answerRecord = await models.answer.updateOrCreate(
        { survey_response_id: surveyResponseId, question_id: answer.question_id },
        answerDocument,
      );
      answerRecords.push(answerRecord);
    } catch (error) {
      throw new DatabaseError('saving answer', error);
    }
  }

  return answerRecords;
}
