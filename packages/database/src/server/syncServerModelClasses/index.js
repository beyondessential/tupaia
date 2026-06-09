/**
 * @typedef {import('../../core/DatabaseModel').DatabaseModel} DatabaseModel
 * @typedef {import('../../core/records').PublicSchemaRecordName} PublicSchemaRecordName
 */

import { AnswerModel } from './Answer';

/** @satisfies {Record<PublicSchemaRecordName, typeof DatabaseModel>} */
export const syncServerModelClasses = /** @type {const} */ ({
  Answer: AnswerModel,
});
