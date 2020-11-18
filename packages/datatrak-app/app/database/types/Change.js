/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Object as RealmObject } from 'realm';

export class Change extends RealmObject {
  generateSyncJson(database) {
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
    } else throw new Error(`Unknown change action: ${this.action}`);
    return syncJson;
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
