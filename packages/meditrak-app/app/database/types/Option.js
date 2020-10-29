/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Object as RealmObject } from 'realm';

export class Option extends RealmObject {}

Option.schema = {
  name: 'Option',
  primaryKey: 'id',
  properties: {
    id: 'string',
    value: { type: 'string', default: 'Option not properly synced' },
    label: { type: 'string', optional: true },
    sortOrder: { type: 'int', default: 0 }, // index based sorting, 0 = first
  },
};

Option.requiredData = ['value'];

Option.construct = (database, data) => {
  const { optionSetId, ...restOfData } = data;
  const optionSet = database.getOrCreate('OptionSet', optionSetId);
  const option = database.update('Option', restOfData);
  optionSet.addOptionIfUnique(option);
  return option;
};
