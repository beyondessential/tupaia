/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { splitStringOn } from '../../utilities';

const OPTION_JSON_FIELD_LIST = ['attributes'];

export const processAutocompleteConfig = async (models, config) => {
  const optionJsonFields = translateOptionJsonFields(config);
  return replaceQuestionCodesWithIds(models, optionJsonFields);
};

// JSON subfields will be in the format field.subfield, e.g. 'attributes.parent_project'
const isJsonSubfield = fieldKey => OPTION_JSON_FIELD_LIST.find(field => fieldKey.startsWith(field));

const translateOptionJsonFields = config => {
  const resultConfig = {};

  Object.keys(config).forEach(fieldKey => {
    const questionCode = config[fieldKey];

    if (isJsonSubfield(fieldKey)) {
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
    if (OPTION_JSON_FIELD_LIST.includes(fieldKey)) {
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
