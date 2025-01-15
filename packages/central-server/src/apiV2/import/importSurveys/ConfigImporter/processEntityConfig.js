import { nestConfig, translateQuestionCodeToId, splitStringOnComma } from '../../../utilities';

import { isYes } from '../utilities';

const valueTranslators = {
  createNew: value => isYes(value),
  hideParentName: value => isYes(value),
  generateQrCode: value => isYes(value),
  allowScanQrCode: value => isYes(value),
  'filter.parent': async (value, models) => translateQuestionCodeToId(models.question, value),
  'filter.grandparent': async (value, models) => translateQuestionCodeToId(models.question, value),
  'fields.parent': async (value, models) => translateQuestionCodeToId(models.question, value),
  'filter.type': value => splitStringOnComma(value),
  'filter.attributes.type': async (value, models) =>
    translateQuestionCodeToId(models.question, value),
  'fields.attributes.type': async (value, models) =>
    translateQuestionCodeToId(models.question, value),
  'fields.code': async (value, models) => translateQuestionCodeToId(models.question, value),
  'fields.name': async (value, models) => translateQuestionCodeToId(models.question, value),
};

const fieldTranslators = {
  'filter.parent': 'filter.parentId',
  'filter.grandparent': 'filter.grandparentId',
  'fields.parent': 'fields.parentId',
};

const translateFields = config => {
  return Object.fromEntries(
    Object.entries(config).map(([field, value]) => {
      const translatedField = fieldTranslators[field] || field;
      return [translatedField, value];
    }),
  );
};

const translateValues = async (config, models) => {
  const translatedValuesWithFields = await Promise.all(
    Object.entries(config).map(async ([field, value]) => {
      if (valueTranslators[field]) {
        const translatedValue = await valueTranslators[field](value, models);
        return [field, translatedValue];
      }
      return [field, value];
    }),
  );
  return Object.fromEntries(translatedValuesWithFields);
};

export const processEntityConfig = async (models, config) => {
  const configWithTranslatedValues = await translateValues(config, models);
  const configWithTranslatedValuesAndFields = translateFields(configWithTranslatedValues);
  const configWithNestedFields = nestConfig(configWithTranslatedValuesAndFields);

  return configWithNestedFields;
};
