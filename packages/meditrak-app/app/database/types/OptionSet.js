/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Object as RealmObject } from 'realm';
import { doesIdExist } from './utilities';

export class OptionSet extends RealmObject {
  getLargestSortOrder() {
    const sortOrders = this.options.map(o => o.sortOrder);
    return Math.max(...sortOrders);
  }
}

OptionSet.schema = {
  name: 'OptionSet',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: { type: 'string', default: 'OptionSet not properly synced' },
    options: {
      type: 'linkingObjects',
      objectType: 'Option',
      property: 'optionSet',
    },
  },
};

OptionSet.requiredData = ['name'];

OptionSet.construct = (database, data) => database.update('OptionSet', data);
