import AWS from 'aws-sdk';
import {
  DatabaseError,
  getS3ImageFilePath,
  S3Client,
  S3_BUCKET_PATH,
  UploadError,
} from '@tupaia/utils';

export async function upsertAnswers(models, answers, surveyResponseId) {
  return Promise.all(
    answers.map(async answer => {
      const answerDocument = {
        id: answer.id,
        type: answer.type,
        question_id: answer.question_id,
        survey_response_id: surveyResponseId,
      };

      if (answer.type === 'Photo') {
        const validFileIdRegex = RegExp('^[a-f\\d]{24}$');
        if (validFileIdRegex.test(answer.body)) {
          // if this is passed a valid id in the answer body
          answerDocument.text = `${S3_BUCKET_PATH}${getS3ImageFilePath()}${answer.body}.png`;
        } else {
          // included for backwards compatibility passing base64 strings for images
          try {
            const s3Client = new S3Client(new AWS.S3());
            answerDocument.text = await s3Client.uploadImage(answer.body);
          } catch (error) {
            throw new UploadError(error);
          }
        }
      } else {
        answerDocument.text = answer.body;
      }

      try {
        return models.answer.updateOrCreate(
          { survey_response_id: surveyResponseId, question_id: answer.question_id },
          answerDocument,
        );
      } catch (error) {
        throw new DatabaseError('saving answer', error);
      }
    }),
  );
}
