import { KeyValueCellBuilder } from '../KeyValueCellBuilder';

const fetchQuestionCode = async (questionId, models) => {
  const question = await models.question.findById(questionId);
  if (!question) {
    throw new Error(`Could not find a question with id matching ${questionId}`);
  }
  return question.code;
};

const FIELD_TRANSLATION = {
  'filter.parentId.questionId': 'filter.parent',
  'filter.grandparentId.questionId': 'filter.grandparent',
  'fields.parentId.questionId': 'fields.parent',
  'fields.attributes.type.questionId': 'fields.attributes.type',
  'filter.attributes.type.questionId': 'filter.attributes.type',
  'fields.name.questionId': 'fields.name',
  'fields.code.questionId': 'fields.code',
};

const VALUE_TRANSLATION = {
  createNew: value => (value ? 'Yes' : 'No'),
  allowScanQrCode: value => (value ? 'Yes' : 'No'),
  hideParentName: value => (value ? 'Yes' : 'No'),
  generateQrCode: value => (value ? 'Yes' : 'No'),
  'filter.parent': fetchQuestionCode,
  'filter.grandparent': fetchQuestionCode,
  'fields.parent': fetchQuestionCode,
  'filter.type': value => value.join(','),
  'filter.attributes.type': fetchQuestionCode,
  'fields.attributes.type': fetchQuestionCode,
  'fields.name': fetchQuestionCode,
  'fields.code': fetchQuestionCode,
};

/**
 * {
 *   cat {
 *     name: Buddy
 *     age: 2
 *   }
 * }
 * =>
 * {
 *   cat.name: Buddy
 *   cat.age: 2
 * }
 */

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

export class EntityConfigCellBuilder extends KeyValueCellBuilder {
  async processValue(value, field) {
    return VALUE_TRANSLATION[field] ? VALUE_TRANSLATION[field](value, this.models) : value;
  }

  extractRelevantObject({ entity }) {
    return entity;
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

    const processedFields = [];

    await Promise.all(
      Object.entries(object).map(async ([field, value]) => {
        const processedFieldsAndValues = await this.processField(value, field);

        processedFields.push(...processedFieldsAndValues);
      }),
    );
    return processedFields.join('\r\n');
  }
}
