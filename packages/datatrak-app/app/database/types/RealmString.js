/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Object as RealmObject } from 'realm';

export class RealmString extends RealmObject {
  toString() {
    return this.string;
  }
}

RealmString.schema = {
  name: 'RealmString',
  primaryKey: 'id',
  properties: {
    id: 'string',
    string: 'string',
  },
};

RealmString.construct = () => {
  throw new Error('Syncing in realm strings is not yet supported');
};
