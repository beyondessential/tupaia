import { isPlainObject } from 'es-toolkit';

import { getS3ImageFilePath, S3_BUCKET_PATH } from '@tupaia/server-utils';
import { isObjectId, isValidHttpUrl } from '@tupaia/tsutils';
import { QuestionType } from '@tupaia/types';

/**
 * @typedef {import('@tupaia/types').Answer} Answer
 * @typedef {(answer: Answer) => Promise<Answer["text"]>} AnswerBodyParser
 */

/**
 * @type {AnswerBodyParser}
 * @privateRemarks If the answer is a file object, upload it to S3 and save the URL as the answer.
 * If it’s not a file object, that means it is just a URL to a file, which should be handled by the
 * caller.
 */
async function getFileAnswerText(answer) {
  if (answer.type !== QuestionType.File) {
    throw new Error(`getFileAnswerText called with answer of type ${answer.type}`);
  }

  if (
    !answer.body ||
    !Object.hasOwn(answer.body, 'uniqueFileName') ||
    !Object.hasOwn(answer.body, 'data')
  ) {
    return answer.body;
  }

  return JSON.stringify(answer.body);
}

/**
 * @type {AnswerBodyParser}
 */
async function getGeolocateAnswerText(answer) {
  if (answer.type !== QuestionType.Geolocate) {
    throw new Error(`getGeolocateAnswerText called with answer of type ${answer.type}`);
  }

  return isPlainObject(answer.body) ? JSON.stringify(answer.body) : answer.body;
}

/**
 * @type {AnswerBodyParser}
 */
async function getPhotoAnswerText(answer) {
  if (answer.type !== QuestionType.Photo) {
    throw new Error(`getPhotoAnswerText called with answer of type ${answer.type}`);
  }

  if (isValidHttpUrl(answer.body)) return answer.body;

  if (isObjectId(answer.body)) {
    // Photo uploaded from MediTrak, which always uploads JPEG data, which is converted to WebP
    const s3ImagePath = getS3ImageFilePath();
    return `${S3_BUCKET_PATH}${s3ImagePath}${answer.body}.webp`;
  }

  return answer.body;
}

/** @type {Record<QuestionType, AnswerBodyParser>} */
const offlineAnswerBodyParsers = {
  [QuestionType.File]: getFileAnswerText,
  [QuestionType.Geolocate]: getGeolocateAnswerText,
  [QuestionType.Photo]: getPhotoAnswerText,
};

/**
 * @type {AnswerBodyParser}
 * @param {import('@tupaia/types').Answer} answer
 * @param {Record<QuestionType, AnswerBodyParser> | undefined} [customParsers]
 * @returns {Promise<Answer["text"]>}
 */
export async function getAnswerText(answer, customParsers) {
  const parsers = { ...offlineAnswerBodyParsers, ...customParsers };
  return answer.type in parsers ? await parsers[answer.type](answer) : answer.body;
}
