/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Object as RealmObject } from 'realm';

export class File extends RealmObject {
  toJson() {
    return {
      id: this.id,
      filename: this.filename,
      data: this.data,
    };
  }
}

File.schema = {
  name: 'File',
  primaryKey: 'id',
  properties: {
    id: 'string',
    filename: 'string',
    data: { type: 'string', default: '' },
  },
};

File.construct = () => {
  throw new Error('Syncing in files not yet supported');
};
