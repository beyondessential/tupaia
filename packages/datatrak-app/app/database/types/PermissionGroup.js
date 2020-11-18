/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Object as RealmObject } from 'realm';

export class PermissionGroup extends RealmObject {}

PermissionGroup.schema = {
  name: 'PermissionGroup',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: { type: 'string', default: 'PermissionGroup not properly synchronised' },
  },
};

PermissionGroup.requiredData = ['name'];

PermissionGroup.construct = (database, data) => {
  const { parentId, ...restOfData } = data;
  const permissionGroupObject = restOfData;
  return database.update('PermissionGroup', permissionGroupObject);
};
