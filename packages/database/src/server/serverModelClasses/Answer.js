import { S3, S3Client } from '@tupaia/server-utils';
import { AnswerModel as AnswerModelBase } from '../../core/modelClasses';

/**
 * Extends from base AnswerModel to handle server-side image and file sync.
 */
export class AnswerModel extends AnswerModelBase {
  async incomingSyncHook(records) {
    const { PHOTO, FILE } = this.constructor.types;
    const uploadMethods = {
      [PHOTO]: 'uploadImage',
      [FILE]: 'uploadFile',
    };

    const s3Client = new S3Client(new S3());
    const updates = [];

    for (const record of records) {
      if ([PHOTO, FILE].includes(record.data.type)) {
        const uploadMethod = uploadMethods[record.data.type];
        const newAnswerText = await s3Client[uploadMethod](record.data.text);
        updates.push({ ...record, data: { ...record.data, text: newAnswerText } });
      }
    }

    return { updates };
  }
}
