/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { KeyValueCellBuilder } from './KeyValueCellBuilder';

const SPECIAL_VALUE_PROCESSORS = {
  type: value => value.join(','),
  createNew: value => (value ? 'Yes' : 'No'),
};
const KEY_TRANSLATION = {
  parentId: 'parent',
  grandparentId: 'grandparent',
};

export class EntityConfigCellBuilder extends KeyValueCellBuilder {
  processKey(key) {
    return KEY_TRANSLATION[key] || key;
  }

  async processValue(value, key) {
    return SPECIAL_VALUE_PROCESSORS[key]
      ? SPECIAL_VALUE_PROCESSORS[key](value)
      : this.fetchQuestionCode(value);
  }

  extractRelevantObject({ entity }) {
    return entity;
  }
}
