/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

export class KeyValueCellBuilder {
  constructor(models) {
    this.models = models;
  }

  fetchQuestionCode = async ({ questionId }) => {
    const question = await this.models.question.findById(questionId);
    if (!question) {
      throw new Error(`Could not find a question with id matching ${questionId}`);
    }
    return question.code;
  };

  async processKey(key) {
    return key;
  }

  async processValue(value, key) {
    if (value === null) throw new Error('Cannot process value: null');
    if (Array.isArray(value)) return value.join(',');
    if (typeof value === 'object') {
      return (
        await Promise.all(
          Object.entries(value).map(async ([key_, value_]) => {
            const processedKey = await this.processKey(key_);
            const processedValue = await this.processValue(value_, key_);
            return `${processedKey}: ${processedValue}`;
          }),
        )
      ).join(',');
    }

    return value.toString();
  }

  extractRelevantObject(object) {
    return object;
  }

  async build(jsonStringOrObject) {
    if (!jsonStringOrObject) {
      return '';
    }
    const fullObject =
      typeof jsonStringOrObject === 'string' ? JSON.parse(jsonStringOrObject) : jsonStringOrObject;
    console.log({ fullObject });
    const object = this.extractRelevantObject(fullObject) || {};
    const processedFields = await Promise.all(
      Object.entries(object).map(async ([key, value]) => {
        const processedKey = await this.processKey(key);
        const processedValue = await this.processValue(value, key);
        console.log('build', { value, processedValue });
        return `${processedKey}: ${processedValue}`;
      }),
    );
    return processedFields.join('\r\n');
  }
}
