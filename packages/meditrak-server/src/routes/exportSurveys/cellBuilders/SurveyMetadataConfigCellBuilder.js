/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { KeyValueCellBuilder } from './KeyValueCellBuilder';

export class SurveyMetadataConfigCellBuilder extends KeyValueCellBuilder {
  async processValue(value) {
    return this.fetchQuestionCode(value);
  }

  // disable class-methods-use-this for functions that are overriding parent methods
  /*eslint-disable class-methods-use-this */
  extractRelevantObject(metadata) {
    const { eventOrgUnit } = metadata.dhis2 || {};
    return eventOrgUnit ? { eventOrgUnit } : {};
  }
  /*eslint-enable class-methods-use-this */
}
