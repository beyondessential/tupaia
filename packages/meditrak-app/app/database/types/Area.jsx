import { Object as RealmObject } from 'realm';

export class Area extends RealmObject {
  toString() {
    const parentString = this.parent ? `, ${this.parent.toString()}` : '';
    return this.name + parentString;
  }
}

Area.schema = {
  name: 'Area',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: { type: 'string', default: 'Area not properly synchronised' },
    organisationUnitCode: { type: 'string', optional: true },
    country: { type: 'object', objectType: 'Country', optional: true },
    parent: { type: 'object', objectType: 'Area', optional: true },
  },
};

Area.requiredData = ['name', 'countryId'];

Area.construct = (database, data) => {
  const { parentId, countryId, ...restOfData } = data;
  const areaObject = restOfData;
  if (parentId) areaObject.parent = database.getOrCreate('Area', parentId);
  if (countryId) areaObject.country = database.getOrCreate('Country', countryId);
  return database.update('Area', areaObject);
};
