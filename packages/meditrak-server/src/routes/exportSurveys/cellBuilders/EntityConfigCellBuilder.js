/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable class-methods-use-this */

import { KeyValueCellBuilder } from './KeyValueCellBuilder';

const ENTITY_CONFIG_VALUE_PROCESSORS = {
  type: value => value.join(','),
  createNew: value => (value ? 'Yes' : 'No'),
};
const ENTITY_CONFIG_SPECIAL_KEYS = {
  parentId: 'parent',
  grandparentId: 'grandparent',
};

export class EntityConfigCellBuilder extends KeyValueCellBuilder {
  processKey(key) {
    return ENTITY_CONFIG_SPECIAL_KEYS[key] || key;
  }

  async processValue(value, key) {
    return ENTITY_CONFIG_VALUE_PROCESSORS[key]
      ? ENTITY_CONFIG_VALUE_PROCESSORS[key](value)
      : this.fetchQuestionCode(value);
  }

  extractRelevantObject({ entity }) {
    return entity;
  }
}
