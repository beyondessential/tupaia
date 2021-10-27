/**
 * Tupaia MediTrak
 * Copyright (c) 2021 Beyond Essential Systems Pty Ltd
 */

import { KeyValueCellBuilder } from './KeyValueCellBuilder';

export class ConditionConfigCellBuilder extends KeyValueCellBuilder {
  extractRelevantObject({ condition }) {
    return condition;
  }

  // We have to override the base class' build method because
  // 'conditions' and 'defaultValues' have to be built together
  async build(jsonStringOrObject) {
    if (!jsonStringOrObject) {
      return '';
    }
    const fullObject =
      typeof jsonStringOrObject === 'string' ? JSON.parse(jsonStringOrObject) : jsonStringOrObject;
    const config = this.extractRelevantObject(fullObject) || {};
    const { conditions } = config;

    const translatedConfig = {
      conditions: 'a',
      defaultValues: 'a',
    };

    return Object.entries(translatedConfig)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\r\n');
  }
}
