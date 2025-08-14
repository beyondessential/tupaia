import { Object as RealmObject } from 'realm';

export class PermissionGroup extends RealmObject {}

PermissionGroup.schema = {
  name: 'PermissionGroup',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: { type: 'string', default: 'PermissionGroup not properly synchronised' },
    parentId: { type: 'string', optional: true },
  },
};

PermissionGroup.requiredData = ['name'];

PermissionGroup.construct = (database, data) => {
  return database.update('PermissionGroup', data);
};
