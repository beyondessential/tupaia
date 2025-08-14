import { translateQuestionCodeToId } from '../../../utilities';

const QUESTION_FIELDS = ['shouldCreateTask', 'entityId', 'dueDate', 'assignee'];

const translateValues = async (config, models) => {
  const translatedValuesWithFields = await Promise.all(
    Object.entries(config).map(async ([field, value]) => {
      if (QUESTION_FIELDS.includes(field)) {
        const translatedValue = await translateQuestionCodeToId(models.question, value);
        return [field, translatedValue];
      }
      return [field, value];
    }),
  );
  return Object.fromEntries(translatedValuesWithFields);
};

export const processTaskConfig = async (models, config) => {
  const translatedConfig = await translateValues(config, models);
  return translatedConfig;
};
