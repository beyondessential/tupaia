import { Object as RealmObject } from 'realm';

export class UserEntityPermission extends RealmObject {}

UserEntityPermission.schema = {
  name: 'UserEntityPermission',
  primaryKey: 'id',
  properties: {
    id: 'string',
    userId: { type: 'string', default: 'UserEntityPermission not properly synchronised' },
    entityId: { type: 'string', default: '' },
    permissionGroupId: {
      type: 'string',
      default: '',
    },
  },
};

UserEntityPermission.requiredData = ['userId', 'entityId', 'permissionGroupId'];

UserEntityPermission.construct = (database, data) => {
  return database.update('UserEntityPermission', data);
};
