import { Object as RealmObject } from 'realm';

export class Entity extends RealmObject {
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
    parent: { type: 'object', objectType: 'Entity', optional: true },
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
