/* Much of this is duplicated in @tupaia/database/core/modelClasses/SurveyResponse/getAnswerText */

import { S3, S3Client, S3_BUCKET_PATH, getS3ImageFilePath } from '@tupaia/server-utils';
import { isValidHttpUrl } from '@tupaia/tsutils';
import { QuestionType } from '@tupaia/types';

function isValidFileId(str) {
  return /^[a-f\d]{24}$/.test(str);
}

/**
 * @typedef {import('@tupaia/types').Answer} Answer
 * @typedef {(answer: Answer) => Promise<Answer["text"]>} GetAnswerTextFunction
 */

/**
 * @type {GetAnswerTextFunction}
 * @privateRemarks If the answer is a file object, upload it to S3 and save the URL as the answer.
 * If it’s not a file object, that means it is just a URL to a file, which should be handled by the
 * caller.
 */
async function getFileAnswerText(answer) {
  if (answer.type !== QuestionType.File) {
    throw new Error(`getFileAnswerText called with answer of type ${answer.type}`);
  }

  if (!answer.body?.hasOwnProperty('uniqueFileName') || !answer.body?.hasOwnProperty('data')) {
    return answer.body;
  }

  const s3Client = new S3Client(new S3());
  await s3Client.uploadFile(answer.body.uniqueFileName, answer.body.data);

  return answer.body.uniqueFileName;
}

/**
 * @type {GetAnswerTextFunction}
 */
async function getPhotoAnswerText(answer) {
  if (answer.type !== QuestionType.Photo) {
    throw new Error(`getPhotoAnswerText called with answer of type ${answer.type}`);
  }

  if (isValidHttpUrl(answer.body)) return answer.body;

  if (isValidFileId(answer.body)) {
    const s3ImagePath = getS3ImageFilePath();
    return `${S3_BUCKET_PATH}${s3ImagePath}${answer.body}.png`;
  }

  // Included for backward compatibility passing base64 strings for images, and for datatrak-web to
  // upload images in answers
  const s3Client = new S3Client(new S3());
  return await s3Client.uploadImage(answer.body);
}

export const ANSWER_BODY_PARSERS = {
  [QuestionType.File]: getFileAnswerText,
  [QuestionType.Photo]: getPhotoAnswerText,
};
