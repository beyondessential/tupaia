/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

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

UserEntityPermission.requiredData = ['userId'];

UserEntityPermission.construct = (database, data) => {
  return database.update('UserEntityPermission', data);
};
