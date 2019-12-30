/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { KeyValueCellBuilder } from './KeyValueCellBuilder';

export class VisibilityCriteriaCellBuilder extends KeyValueCellBuilder {
  async processKey(criterionKey) {
    // criterionKey is usually a questionId, but is sometimes "_conjunction" etc.
    const question = await this.models.question.findById(criterionKey);
    return question ? question.code : criterionKey;
  }

  // disable class-methods-use-this for functions that are overriding parent methods
  /*eslint-disable class-methods-use-this */
  async processValue(value) {
    return Array.isArray(value) ? value.join(', ') : value;
  }
  /*eslint-enable class-methods-use-this */
}
