/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  translateQuestionDependentNestedFields,
  replaceNestedQuestionCodesWithIds,
} from '../../../utilities';
import { isYes } from '../utilities';

const OPTION_JSON_FIELD_LIST = ['attributes'];

/**
 * Convert config of Autocomplete Questions.
 *
 * Before:
 * attributes.parent_project: exodus
 *
 * After:
 * attributes: {
 *    parent_project: { questionId: "${questionId}" }
 * }
 */
export const processAutocompleteConfig = async (models, config) => {
  const { createNew } = config;
  const optionJsonFields = translateQuestionDependentNestedFields(config, OPTION_JSON_FIELD_LIST);
  const translatedOptionJsonFields = await replaceNestedQuestionCodesWithIds(
    models,
    optionJsonFields,
    OPTION_JSON_FIELD_LIST,
  );

  return {
    createNew: isYes(createNew),
    ...translatedOptionJsonFields,
  };
};
