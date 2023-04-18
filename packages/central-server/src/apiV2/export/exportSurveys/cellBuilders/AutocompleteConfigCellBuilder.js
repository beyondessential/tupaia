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

  /**
   * Currently we only actually support parent_project as an attribute
   * But this processor function processes all keys for future proofing
   * Since it's not a one to one relationship we can't run it through the generic handlers
   *
   * Input:
   * attibutes: {
   *   parent_project: {
   *    questionId: <guid>
   *   }
   * }
   * Converted to Excel config:
   * attributes.parent_project: <questionCode>
   */
  async processAttributesField(attributesObject = {}) {
    return Promise.all(
      Object.entries(attributesObject).map(async ([key, value]) => {
        const processedValue = await this.fetchQuestionCode(value);
        return `attributes.${key}: ${processedValue}`;
      }),
    );
  }

  extractRelevantObject({ autocomplete }) {
    return autocomplete;
  }

  // We need to override the build function so we can process the attributes field separately
  async build(jsonStringOrObject) {
    if (!jsonStringOrObject) {
      return '';
    }
    const fullObject =
      typeof jsonStringOrObject === 'string' ? JSON.parse(jsonStringOrObject) : jsonStringOrObject;
    const { attributes, ...object } = this.extractRelevantObject(fullObject) || {};
    const attributeFields = await this.processAttributesField(attributes);
    const processedFields = await Promise.all(
      Object.entries(object).map(async ([key, value]) => {
        if (this.individualFieldProcessors[key]) {
          return this.individualFieldProcessors[key](value);
        }
        const processedKey = await this.processKey(key);
        const processedValue = await this.processValue(value, key);
        return `${processedKey}: ${processedValue}`;
      }),
    );
    console.log('attibuteFields', attributeFields);
    console.log('processedFields', processedFields);
    return [...attributeFields, ...processedFields].join('\r\n');
  }
}
