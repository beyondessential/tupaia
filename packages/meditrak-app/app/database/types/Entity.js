/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Object as RealmObject } from 'realm';

export class Entity extends RealmObject {
  getReduxStoreData() {
    const { name, code = '', id, countryCode, parent, type, attributes } = this;
    const reduxStoreData = {
      name,
      code,
      id,
      type,
      parent: '',
      area: parent && parent.name,
      countryCode,
      attributes: attributes ? JSON.parse(attributes) : {},
    };
    return reduxStoreData;
  }

  toJson() {
    return {
      id: this.id,
      name: this.name,
      country_code: this.countryCode,
      parent_id: this.parent.id,
      code: this.code,
      type: this.type,
      attributes: this.attributes ? JSON.parse(this.attributes) : {},
    };
  }
}

Entity.schema = {
  name: 'Entity',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: { type: 'string', default: 'Entity not properly synchronised' },
    countryCode: { type: 'string', default: 'Entity not properly synchronised' },
    parent: { type: 'Entity', optional: true },
    code: { type: 'string', optional: true },
    type: { type: 'string', default: 'Entity not properly synchronised' },
    attributes: { type: 'string', default: '{}' },
  },
};

Entity.requiredData = ['name', 'type'];

Entity.construct = (database, data) => {
  const { parentId, attributes, ...restOfData } = data;
  const entityObject = restOfData;
  if (parentId) entityObject.parent = database.getOrCreate('Entity', parentId);
  if (attributes) entityObject.attributes = JSON.stringify(attributes);

  return database.update('Entity', entityObject);
};
