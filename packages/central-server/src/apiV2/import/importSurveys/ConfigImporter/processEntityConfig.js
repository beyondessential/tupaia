/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  translateQuestionDependentNestedFields,
  replaceNestedQuestionCodesWithIds,
} from '../../../utilities';
import { isYes } from '../utilities';

const fieldMappers = {
  createNew: value => isYes(value),
  generateQrCode: value => isYes(value),
  allowScanQrCode: value => isYes(value),
};

const ENTITY_KEYS_WITH_NESTED_FIELDS = ['fields', 'filter'];

export const processEntityConfig = async (models, config) => {
  const entityFilterAndUpsertFields = translateQuestionDependentNestedFields(
    config,
    ENTITY_KEYS_WITH_NESTED_FIELDS,
  );

  const processedConfig = Object.fromEntries(
    Object.entries(config)
      .filter(([field]) => fieldMappers[field])
      .map(([field, value]) => [field, fieldMappers[field](value)]),
  );

  const fullConfig = {
    ...processedConfig,
    ...entityFilterAndUpsertFields,
  };

  const resultConfig = await replaceNestedQuestionCodesWithIds(
    models,
    fullConfig,
    ENTITY_KEYS_WITH_NESTED_FIELDS,
  );

  return resultConfig;
};
