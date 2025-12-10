/*
 * Duplicated from @tupaia/central-server/dataAccessors/answerBodyParsers, with online-only
 * functionality removed. (Deferred to RN-1752)
 */

import { isPlainObject } from 'es-toolkit';

import { isValidHttpUrl } from '@tupaia/tsutils';
import { QuestionType } from '@tupaia/types';

function isValidFileId(str) {
  return /^[a-f\d]{24}$/.test(str);
}

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

  if (!answer.body?.hasOwnProperty('uniqueFileName') || !answer.body?.hasOwnProperty('data')) {
    return answer.body;
  }

  return answer.body;
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

  if (isValidFileId(answer.body)) {
    // TODO: Figure out why importing these from @tupaia/server-utils breaks @tupaia/datatrak-web
    const isProduction = () =>
      (process.env.IS_PRODUCTION_ENVIRONMENT === 'true' || process.env.NODE_ENV === 'production') &&
      !process.env.CI_BUILD_ID;
    const S3_BUCKET_PATH = `https://s3-ap-southeast-2.amazonaws.com/tupaia/`;
    const s3ImagePath = isProduction() ? 'uploads/images/' : 'dev_uploads/images/';

    return `${S3_BUCKET_PATH}${s3ImagePath}${answer.body}.png`;
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
