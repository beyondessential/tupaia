/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Object as RealmObject } from 'realm';

export class Option extends RealmObject {
  toJson() {
    return {
      id: this.id,
      value: this.value,
      label: this.label,
      sort_order: this.sortOrder,
      attributes: this.attributes ? JSON.parse(this.attributes) : {},
      option_set_id: this.optionSetId,
    };
  }
}

Option.schema = {
  name: 'Option',
  primaryKey: 'id',
  properties: {
    id: 'string',
    value: { type: 'string', default: 'Option not properly synced' },
    label: { type: 'string', optional: true },
    sortOrder: { type: 'int', default: 0 }, // index based sorting, 0 = first
    attributes: { type: 'string', default: '{}' },
    optionSetId: 'string',
  },
};

Option.requiredData = ['value'];

Option.construct = (database, data) => {
  const { attributes, ...restOfData } = data;
  const optionObject = restOfData;
  if (attributes) {
    optionObject.attributes = JSON.stringify(attributes);
  }
  const optionSet = database.getOrCreate('OptionSet', data.optionSetId);
  const option = database.update('Option', optionObject);
  optionSet.addOptionIfUnique(option);
  return option;
};
