/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { KeyValueCellBuilder } from './KeyValueCellBuilder';

const ENTITY_CONFIG_VALUE_PROCESSORS = {
  type: value => value.join(','),
  createNew: value => (value ? 'Yes' : 'No'),
};
const ENTITY_CONFIG_SPECIAL_KEYS = {
  parentId: 'parent',
};

export class EntityConfigCellBuilder extends KeyValueCellBuilder {
  // disable class-methods-use-this for functions that are candidates for subclass overriding
  /*eslint-disable class-methods-use-this */
  processKey(key) {
    return ENTITY_CONFIG_SPECIAL_KEYS[key] || key;
  }
  /*eslint-enable class-methods-use-this */

  async processValue(value, key) {
    return ENTITY_CONFIG_VALUE_PROCESSORS[key]
      ? ENTITY_CONFIG_VALUE_PROCESSORS[key](value)
      : this.fetchQuestionCode(value);
  }

  /*eslint-disable class-methods-use-this */
  extractRelevantObject({ entity }) {
    return entity;
  }
  /*eslint-enable class-methods-use-this */
}
