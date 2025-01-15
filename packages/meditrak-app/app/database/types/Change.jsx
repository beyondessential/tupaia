import { Object as RealmObject } from 'realm';
import RNFS from 'react-native-fs';

export class Change extends RealmObject {
  async generateSyncJson(database) {
    const syncJson = {
      action: this.action,
      payload: {},
    };
    if (this.action === 'SubmitSurveyResponse') {
      const response = database.findOne('Response', this.recordId);
      if (!response) throw new Error('Failed to find survey response when syncing');
      syncJson.payload = {
        survey_response: response.toJson(),
      };
    } else if (this.action === 'AddSurveyImage') {
      const image = database.findOne('Image', this.recordId);
      if (!image) throw new Error('Failed to find image when syncing');
      syncJson.payload = image.toJson();
    } else if (this.action === 'AddSurveyFile') {
      const file = database.findOne('File', this.recordId);
      if (!file) throw new Error('Failed to find file record when syncing');
      const payload = file.toJson();
      // Read the file as a base64 encoded string 'data'
      const { filePathOnDevice } = payload;
      const data = await RNFS.readFile(filePathOnDevice, 'base64');
      syncJson.payload = {
        ...payload,
        data,
      };
    } else {
      throw new Error(`Unknown change action: ${this.action}`);
    }
    return syncJson;
  }

  async cleanupAfterPush(database) {
    if (this.action === 'AddSurveyFile') {
      const file = database.findOne('File', this.recordId);
      if (!file) throw new Error('Failed to find file record when running cleanupAfterSync');
      const payload = file.toJson();
      // Delete local file copy
      const { filePathOnDevice } = payload;
      await RNFS.unlink(filePathOnDevice);
    }
  }
}

Change.schema = {
  name: 'Change',
  primaryKey: 'id',
  properties: {
    id: 'string',
    action: 'string',
    recordId: 'string',
    timestamp: { type: 'int', default: Date.now() },
  },
};

Change.construct = () => {
  throw new Error('Syncing in records of type Change is illegal');
};
