/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  translateQuestionDependentNestedFields,
  replaceNestedQuestionCodesWithIds,
} from '../../../utilities';
import { isYes } from '../utilities';

const ENTITY_KEYS_WITH_NESTED_FIELDS = ['fields', 'filter'];

export const processEntityConfig = async (models, config) => {
  const entityFilterAndUpsertFields = translateQuestionDependentNestedFields(
    config,
    ENTITY_KEYS_WITH_NESTED_FIELDS,
  );

  const processedConfig = {
    createNew: isYes(config.createNew),
    ...entityFilterAndUpsertFields,
  };

  // Optional configs
  if (config.generateQrCode !== undefined) {
    processedConfig.generateQrCode = isYes(config.generateQrCode);
  }
  if (config.allowScanQrCode !== undefined) {
    processedConfig.allowScanQrCode = isYes(config.allowScanQrCode);
  }

  const resultConfig = await replaceNestedQuestionCodesWithIds(
    models,
    processedConfig,
    ENTITY_KEYS_WITH_NESTED_FIELDS,
  );

  return resultConfig;
};
