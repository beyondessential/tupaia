import { Object as RealmObject } from 'realm';

export class Clinic extends RealmObject {
  getReduxStoreData() {
    const { name, code = '', id, area } = this;
    const { country } = area;
    const reduxStoreData = {
      name,
      code,
      id,
      countryId: country.id,
    };
    if (area) reduxStoreData.area = area.toString();
    return reduxStoreData;
  }
}

Clinic.schema = {
  name: 'Clinic',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: { type: 'string', default: 'Clinic not properly synchronised' },
    area: { type: 'object', objectType: 'Area', optional: true },
    code: { type: 'string', optional: true },
    latitude: { type: 'double', optional: true },
    longitude: { type: 'double', optional: true },
    isActive: { type: 'bool', default: true },
  },
};

Clinic.requiredData = ['name'];

Clinic.construct = (database, data) => {
  const { geographicalAreaId, ...restOfData } = data;
  const clinicObject = restOfData;
  if (geographicalAreaId) clinicObject.area = database.getOrCreate('Area', geographicalAreaId);
  return database.update('Clinic', clinicObject);
};
