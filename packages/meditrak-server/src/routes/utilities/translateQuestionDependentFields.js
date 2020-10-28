import { splitStringOn } from './split';

// Subfields will be in the format field.subfield, e.g. 'attributes.type'
const isSubfield = (nestedFieldList, fieldKey) =>
  nestedFieldList.find(field => fieldKey.startsWith(field));

export const translateQuestionDependentFields = (config, fieldTranslation) => {
  const resultConfig = {};

  Object.entries(config).forEach(([fieldKey, questionCode]) => {
    const translatedFieldKey = fieldTranslation[fieldKey];

    if (translatedFieldKey) {
      resultConfig[translatedFieldKey] = questionCode;
    }
  });

  return resultConfig;
};

export const translateQuestionDependentNestedFields = (config, nestedFieldList) => {
  const resultConfig = {};

  Object.entries(config).forEach(([fieldKey, questionCode]) => {
    if (isSubfield(nestedFieldList, fieldKey)) {
      const [primaryFieldKey, subfieldKey] = splitStringOn(fieldKey, '.');
      if (!resultConfig[primaryFieldKey]) {
        resultConfig[primaryFieldKey] = {};
      }
      resultConfig[primaryFieldKey][subfieldKey] = questionCode;
    }
  });

  return resultConfig;
};

export const replaceQuestionCodesWithIds = async (models, config, fieldList) => {
  const resultConfig = {};

  await Promise.all(
    Object.entries(config).map(async ([fieldKey, value]) => {
      let newValue = value;
      if (fieldList.includes(fieldKey)) {
        const { id: questionId } = await models.question.findOne({ code: value });
        newValue = { questionId };
      }
      resultConfig[fieldKey] = newValue;
    }),
  );

  return resultConfig;
};

/**
 * Replace all question codes with question ids in nested config (eg: attributes.type)
 */
export const replaceNestedQuestionCodesWithIds = async (models, config, nestedFieldList) => {
  const resultConfig = {};

  await Promise.all(
    Object.entries(config).map(async ([fieldKey, value]) => {
      let newValue = value;
      if (nestedFieldList.includes(fieldKey)) {
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
    }),
  );

  return resultConfig;
};
