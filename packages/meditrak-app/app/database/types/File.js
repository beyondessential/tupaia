/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Object as RealmObject } from 'realm';

export class File extends RealmObject {
  toJson() {
    return {
      id: this.id,
      uniqueFileName: this.uniqueFileName,
      data: this.data,
    };
  }
}

File.schema = {
  name: 'File',
  primaryKey: 'id',
  properties: {
    id: 'string',
    uniqueFileName: 'string',
    data: { type: 'string', default: '' },
  },
};

File.construct = () => {
  throw new Error('Syncing in files not yet supported');
};
