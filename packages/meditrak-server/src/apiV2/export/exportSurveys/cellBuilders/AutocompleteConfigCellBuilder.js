/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { KeyValueCellBuilder } from './KeyValueCellBuilder';

export class AutocompleteConfigCellBuilder extends KeyValueCellBuilder {
  async processValue(value, key) {
    if (key === 'createNew') {
      return value ? 'Yes' : 'No';
    }
    return value;
  }

  extractRelevantObject({ autocomplete }) {
    return autocomplete;
  }
}
