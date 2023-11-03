/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Object as RealmObject } from 'realm';

export class Country extends RealmObject {
  entity(database) {
    const entities = database.find('Entity', {
      code: this.code,
      name: this.name,
    });

    return entities[0] || null;
  }
}

Country.schema = {
  name: 'Country',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: { type: 'string', default: 'Country not properly synchronised' },
    code: { type: 'string', default: '' },
  },
};

Country.requiredData = ['name', 'code'];

Country.construct = (database, data) => database.update('Country', data);
