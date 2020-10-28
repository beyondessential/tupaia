/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  translateQuestionDependentJsonFields,
  replaceQuestionCodesWithIdsInJson,
} from '../../utilities';

const OPTION_JSON_FIELD_LIST = ['attributes'];

/**
 * Before:
 * attributes.parent_project: exodus
 *
 * After:
 * attributes: {
 *    parent_project: { questionId: "${questionId}" }
 * }
 */
export const processAutocompleteConfig = async (models, config) => {
  const optionJsonFields = translateQuestionDependentJsonFields(config, OPTION_JSON_FIELD_LIST);
  return replaceQuestionCodesWithIdsInJson(models, optionJsonFields, OPTION_JSON_FIELD_LIST);
};
