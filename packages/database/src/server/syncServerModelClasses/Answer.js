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
   * - the photo’s ID, when it has already sent the photo itself as a file (see central-server’s
   *   `uploadSurveyPhoto`), so all that’s needed is its URL;
   * - the photo itself, as a Base64 data URL, from versions that predate that, or for image types
   *   it doesn’t send as files, which is uploaded here; or
   * - a URL, for an answer that already had one, which needs nothing.
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
