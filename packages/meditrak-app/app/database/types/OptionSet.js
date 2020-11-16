/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Object as RealmObject } from 'realm';
import { doesIdExist } from './utilities';

export class OptionSet extends RealmObject {
  addOptionIfUnique(option) {
    if (doesIdExist(this.options, option.id)) return;
    this.options.push(option);
  }

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
    options: 'Option[]',
  },
};

OptionSet.requiredData = ['name'];

OptionSet.construct = (database, data) => database.update('OptionSet', data);
