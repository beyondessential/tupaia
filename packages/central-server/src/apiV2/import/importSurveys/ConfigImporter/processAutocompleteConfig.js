import { nestConfig, translateQuestionCodeToId } from '../../../utilities';
import { isYes } from '../utilities';

const valueTranslators = {
  createNew: value => isYes(value),
};

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
const translateValues = async (config, models) => {
  const translatedValuesWithFields = await Promise.all(
    Object.entries(config).map(async ([field, value]) => {
      if (valueTranslators[field]) {
        const translatedValue = await valueTranslators[field](value, models);
        return [field, translatedValue];
      }
      if (field.startsWith('attributes')) {
        const translatedValue = await translateQuestionCodeToId(models.question, value);
        return [field, translatedValue];
      }
      return [field, value];
    }),
  );
  return Object.fromEntries(translatedValuesWithFields);
};

export const processAutocompleteConfig = async (models, config) => {
  const configWithTranslatedValues = await translateValues(config, models);
  const configWithNestedFields = nestConfig(configWithTranslatedValues);

  return configWithNestedFields;
};
