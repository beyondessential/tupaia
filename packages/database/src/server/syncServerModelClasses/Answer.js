import { getS3ImageUrl, S3Client } from '@tupaia/server-utils';
import { isObjectId, isValidHttpUrl } from '@tupaia/tsutils';
import { QuestionType } from '@tupaia/types';
import { AnswerModel as BaseAnswerModel } from '../../core/modelClasses';

/**
 * Extends from base AnswerModel to handle server-side image and file sync.
 */
export class AnswerModel extends BaseAnswerModel {
  #s3Client;

  constructor(...args) {
    super(...args);
    this.#s3Client = new S3Client();
  }

  /**
   * answer.text for Photo questions stores the image URL. DataTrak sends one of:
   * - the photo itself, as a Base64 data URL, which is uploaded here;
   * - a URL, for an answer that already had one, which needs nothing; or
   * - the photo’s ID, if the photo went missing from the device before it could be sent (see
   *   DataTrak’s `pushOutgoingChanges`). The answer then gets the URL the photo would have had,
   *   as MediTrak’s answers do, rather than holding up every sync from that device.
   *
   * @param {string} text
   * @param {string} answerId
   * @returns {Promise<string | null>} The new text, or `null` to leave it as it is
   */
  async #getPhotoAnswerText(text, answerId) {
    if (isObjectId(text)) return getS3ImageUrl(text);
    if (isValidHttpUrl(text)) return null;
    return await this.#s3Client.uploadImage(text, answerId);
  }

  /** @satisfies {undefined | (records: SyncSnapshotAttributes[]) => Promise<{ inserts: SyncSnapshotAttributes[], updates: SyncSnapshotAttributes[] }>} */
  async incomingSyncHook(records) {
    const uploadPromises = records.map(async record => {
      if (record.data.type === QuestionType.Photo) {
        const newAnswerText = await this.#getPhotoAnswerText(record.data.text, record.data.id);
        if (newAnswerText === null) return null;
        return { ...record, data: { ...record.data, text: newAnswerText } };
      }

      if (record.data.type === QuestionType.File) {
        const { uniqueFileName, data } = JSON.parse(record.data.text);
        if (uniqueFileName && data) {
          // answer.text for File questions store the filename
          void (await this.#s3Client.uploadFile(uniqueFileName, data));
          return { ...record, data: { ...record.data, text: uniqueFileName } };
        }
      }

      return null;
    });

    const updates = (await Promise.all(uploadPromises)).filter(Boolean);

    return { updates };
  }
}
