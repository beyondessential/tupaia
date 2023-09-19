/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Object as RealmObject } from 'realm';

export class SurveyGroup extends RealmObject {
  getReduxStoreData() {
    const { id, name } = this;
    return { id, name };
  }
}

SurveyGroup.schema = {
  name: 'SurveyGroup',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: { type: 'string', default: 'Survey group not properly synced' },
  },
};

SurveyGroup.requiredData = ['name'];

SurveyGroup.construct = (database, data) => database.update('SurveyGroup', data);
