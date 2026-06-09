import { S3, S3Client } from '@tupaia/server-utils';
import { QuestionType } from '@tupaia/types';
import { AnswerModel as BaseAnswerModel } from '../../core/modelClasses';

/**
 * Extends from base AnswerModel to handle server-side image and file sync.
 */
export class AnswerModel extends BaseAnswerModel {
  #s3Client;

  constructor(...args) {
    super(...args);
    this.#s3Client = new S3Client(new S3());
  }

  /** @satisfies {undefined | (records: SyncSnapshotAttributes[]) => Promise<{ inserts: SyncSnapshotAttributes[], updates: SyncSnapshotAttributes[] }>} */
  async incomingSyncHook(records) {
    const uploadPromises = records.map(async record => {
      if (record.data.type === QuestionType.Photo) {
        // answer.text for Image questions store the image URL
        const newAnswerText = await this.#s3Client.uploadImage(record.data.text, record.data.id);
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
