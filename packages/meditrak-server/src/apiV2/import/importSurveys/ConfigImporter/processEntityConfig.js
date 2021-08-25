/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  splitStringOnComma,
  translateQuestionDependentFields,
  translateQuestionDependentNestedFields,
  replaceQuestionCodesWithIds,
  replaceNestedQuestionCodesWithIds,
} from '../../../utilities';
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
  const entityCreationNonJsonFields = translateQuestionDependentFields(
    config,
    ENTITY_CREATION_FIELD_TRANSLATION,
  );
  const entityCreationJsonFields = translateQuestionDependentNestedFields(
    config,
    ENTITY_CREATION_JSON_FIELD_LIST,
  );

  const processedConfig = {
    type: splitStringOnComma(config.type),
    createNew: isYes(config.createNew),
    ...entityCreationNonJsonFields,
    ...entityCreationJsonFields,
  };

  let resultConfig = await replaceQuestionCodesWithIds(
    models,
    processedConfig,
    ENTITY_CREATION_FIELD_LIST,
  );
  resultConfig = await replaceNestedQuestionCodesWithIds(
    models,
    resultConfig,
    ENTITY_CREATION_JSON_FIELD_LIST,
  );

  return resultConfig;
};
