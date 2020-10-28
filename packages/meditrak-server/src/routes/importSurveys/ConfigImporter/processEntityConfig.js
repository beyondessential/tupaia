/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { splitStringOnComma, splitStringOn } from '../../utilities';
import { isYes } from '../utilities';

/**
 * Dictionary of entity creation fields used in the input
 * to the keys that will be used in the output
 */
const ENTITY_CREATION_FIELD_TRANSLATION = {
  name: 'name',
  code: 'code',
  parent: 'parentId',
  grandparent: 'grandparentId',
};

const ENTITY_CREATION_FIELD_LIST = Object.values(ENTITY_CREATION_FIELD_TRANSLATION);
const ENTITY_CREATION_JSON_FIELD_LIST = ['attributes'];

export const processEntityConfig = async (models, config) => {
  const entityCreationFields = translateEntityCreationFields(config);
  const processedConfig = {
    type: splitStringOnComma(config.type),
    createNew: isYes(config.createNew),
    ...entityCreationFields,
  };

  return replaceQuestionCodesWithIds(models, processedConfig);
};

// JSON subfields will be in the format field.subfield, e.g. 'attributes.type'
const isJsonSubfield = fieldKey =>
  ENTITY_CREATION_JSON_FIELD_LIST.find(field => fieldKey.startsWith(field));

const translateEntityCreationFields = config => {
  const resultConfig = {};

  Object.keys(config).forEach(fieldKey => {
    const resultKey = ENTITY_CREATION_FIELD_TRANSLATION[fieldKey];
    const questionCode = config[fieldKey];

    if (resultKey) {
      resultConfig[resultKey] = questionCode;
    } else if (isJsonSubfield(fieldKey)) {
      const [primaryFieldKey, subfieldKey] = splitStringOn(fieldKey, '.');
      if (!resultConfig[primaryFieldKey]) {
        resultConfig[primaryFieldKey] = {};
      }
      resultConfig[primaryFieldKey][subfieldKey] = questionCode;
    }
  });

  return resultConfig;
};

const replaceQuestionCodesWithIds = async (models, config) => {
  const resultConfig = {};
  const encodeField = async ([fieldKey, value]) => {
    let newValue = value;
    if (ENTITY_CREATION_FIELD_LIST.includes(fieldKey)) {
      const { id: questionId } = await models.question.findOne({ code: value });
      newValue = { questionId };
    } else if (ENTITY_CREATION_JSON_FIELD_LIST.includes(fieldKey)) {
      for (let i = 0; i < Object.entries(value).length; i++) {
        const [subfieldKey, questionCode] = Object.entries(value)[i];
        const { id: questionId } = await models.question.findOne({ code: questionCode });
        newValue = {
          ...newValue,
          [subfieldKey]: { questionId },
        };
      }
    }

    resultConfig[fieldKey] = newValue;
  };
  await Promise.all(Object.entries(config).map(encodeField));

  return resultConfig;
};
