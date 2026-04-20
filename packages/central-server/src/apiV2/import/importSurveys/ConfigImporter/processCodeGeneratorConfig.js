import { nestConfig, translateQuestionCodeToId } from '../../../utilities';
import { CODE_GENERATORS } from '../codeGenerators';

const DEFAULT_CODE_GENERATOR = CODE_GENERATORS.MONGO_ID;

const valueTranslators = {
  dynamicPrefix: async (value, models) => translateQuestionCodeToId(models.question, value),
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

export const processCodeGeneratorConfig = async (models, config) => {
  const configWithTranslatedValues = await translateValues(config, models);
  const nestedConfig = nestConfig(configWithTranslatedValues);
  return { type: DEFAULT_CODE_GENERATOR, ...nestedConfig };
};
