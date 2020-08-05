/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable class-methods-use-this */

import { KeyValueCellBuilder } from './KeyValueCellBuilder';

export class SurveyMetadataConfigCellBuilder extends KeyValueCellBuilder {
  valueProcessors = {
    eventOrgUnit: this.fetchQuestionCode,
    dataService: value => value,
  };

  async processValue(value, key) {
    return this.valueProcessors[key](value);
  }

  extractRelevantObject(inputObject) {
    const output = {};
    Object.keys(this.valueProcessors).forEach(key => {
      if (inputObject[key]) {
        output[key] = inputObject[key];
      }
    });

    return output;
  }
}
