/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Object as RealmObject } from 'realm';

export class Image extends RealmObject {
  toJson() {
    return {
      id: this.id,
      data: this.data,
    };
  }
}

Image.schema = {
  name: 'Image',
  primaryKey: 'id',
  properties: {
    id: 'string',
    data: { type: 'string', default: '' },
  },
};

Image.construct = () => {
  throw new Error('Syncing in images not yet supported');
};
