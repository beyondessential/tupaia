/**
 * Tupaia MediTrak
 * Copyright (c) 2021 Beyond Essential Systems Pty Ltd
 */

import { KeyValueCellBuilder } from './KeyValueCellBuilder';

const NON_ID_KEYS = [
  'conditions',
  'defaultValues'
]

export class ConditionConfigCellBuilder extends KeyValueCellBuilder {
  async processKey(key) {
    return key in NON_ID_KEYS ? key : this.fetchQuestionCode(key);
  }

  extractRelevantObject({ condition }) {
    return condition;
  }
}
