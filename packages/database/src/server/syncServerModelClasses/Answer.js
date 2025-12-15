import { S3, S3Client } from '@tupaia/server-utils';
import { AnswerModel as AnswerModelBase } from '../../core/modelClasses';

/**
 * Extends from base AnswerModel to handle server-side image and file sync.
 */
export class AnswerModel extends AnswerModelBase {
  async incomingSyncHook(records) {
    const { PHOTO, FILE } = this.constructor.types;
    const s3Client = new S3Client(new S3());

    const uploadPromises = records.map(async record => {
      if (record.data.type === PHOTO) {
        const newAnswerText = await s3Client.uploadImage(record.data.text, record.data.id);
        return { ...record, data: { ...record.data, text: newAnswerText } };
      }

      if (record.data.type === FILE) {
        const { uniqueFileName, data } = JSON.parse(record.data.text);
        if (uniqueFileName && data) {
          const newAnswerText = await s3Client.uploadFile(uniqueFileName, data);
          return { ...record, data: { ...record.data, text: newAnswerText } };
        }
      }

      return null;
    });

    const updates = (await Promise.all(uploadPromises)).filter(Boolean);

    return { updates };
  }
}
