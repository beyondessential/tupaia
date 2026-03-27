import { KeyValueCellBuilder } from '../KeyValueCellBuilder';

const FIELD_TRANSLATION = {
  'dynamicPrefix.questionId': 'dynamicPrefix',
};

const flattenObject = (value, field, flattenedObject = {}) => {
  if (!(typeof value === 'object' && !Array.isArray(value) && value !== null)) {
    // eslint-disable-next-line no-param-reassign
    flattenedObject[field] = value;
    return;
  }

  Object.entries(value).forEach(([subField, subValue]) => {
    flattenObject(subValue, `${field}.${subField}`, flattenedObject);
  });
};

export class CodeGeneratorConfigCellBuilder extends KeyValueCellBuilder {
  async processValue(value, field) {
    if (field === 'dynamicPrefix') {
      return this.fetchQuestionCode({ questionId: value });
    }
    return value;
  }

  extractRelevantObject({ codeGenerator }) {
    return codeGenerator;
  }

  async processField(rawValue, rawField) {
    const flattenedFields = {};
    flattenObject(rawValue, rawField, flattenedFields);

    const processedFieldsAndValues = await Promise.all(
      Object.entries(flattenedFields).map(async ([field, value]) => {
        const translatedField = FIELD_TRANSLATION[field] || field;
        const translatedValue = await this.processValue(value, translatedField);
        return `${translatedField}: ${translatedValue}`;
      }),
    );
    return processedFieldsAndValues;
  }

  async build(jsonStringOrObject) {
    if (!jsonStringOrObject) {
      return '';
    }

    const fullObject =
      typeof jsonStringOrObject === 'string' ? JSON.parse(jsonStringOrObject) : jsonStringOrObject;
    const object = this.extractRelevantObject(fullObject) || {};

    const processedFieldsPromises = Object.entries(object).map(async ([field, value]) => {
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        return this.processField(value, field);
      }
      const processedValue = await this.processValue(value, field);
      return `${field}: ${processedValue}`;
    });

    const processedFields = (await Promise.all(processedFieldsPromises)).flat();
    return processedFields.join('\r\n');
  }
}
