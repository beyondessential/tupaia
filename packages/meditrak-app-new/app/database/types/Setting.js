/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Object as RealmObject } from 'realm';

export class Setting extends RealmObject {}

Setting.schema = {
  name: 'Setting',
  primaryKey: 'key',
  properties: {
    id: 'string',
    key: 'string',
    value: 'string',
  },
};

Setting.construct = () => {
  throw new Error('Syncing in settings is not yet supported');
};
