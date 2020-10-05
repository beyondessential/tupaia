/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { splitStringOnComma } from '../../utilities';
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
  attributestypeparent: 'attributestypeparentId',
};
const ENTITY_CREATION_FIELD_LIST = Object.values(ENTITY_CREATION_FIELD_TRANSLATION);

export const processEntityConfig = async (models, config) => {
  const entityCreationFields = translateEntityCreationFields(config);
  const processedConfig = {
    type: splitStringOnComma(config.type),
    createNew: isYes(config.createNew),
    ...entityCreationFields,
  };

  return replaceQuestionCodesWithIds(models, processedConfig);
};

const translateEntityCreationFields = config => {
  const resultConfig = {};

  Object.keys(config).forEach(fieldKey => {
    const resultKey = ENTITY_CREATION_FIELD_TRANSLATION[fieldKey];
    if (resultKey) {
      const questionCode = config[fieldKey];
      resultConfig[resultKey] = questionCode;
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
    }

    resultConfig[fieldKey] = newValue;
  };
  await Promise.all(Object.entries(config).map(encodeField));

  return resultConfig;
};
