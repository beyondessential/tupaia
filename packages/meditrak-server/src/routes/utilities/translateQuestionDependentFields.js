import { splitStringOn } from './split';

// JSON subfields will be in the format field.subfield, e.g. 'attributes.type'
const isJsonSubfield = (jsonFieldList, fieldKey) =>
  jsonFieldList.find(field => fieldKey.startsWith(field));

export const translateQuestionDependentNonJsonFields = (config, nonJsonFieldTranslation) => {
  const resultConfig = {};

  Object.entries(config).forEach(([fieldKey, questionCode]) => {
    const nonJsonFieldKey = nonJsonFieldTranslation[fieldKey];

    if (nonJsonFieldKey) {
      resultConfig[nonJsonFieldKey] = questionCode;
    }
  });

  return resultConfig;
};

export const translateQuestionDependentJsonFields = (config, jsonFieldList) => {
  const resultConfig = {};

  Object.entries(config).forEach(([fieldKey, questionCode]) => {
    if (isJsonSubfield(jsonFieldList, fieldKey)) {
      const [primaryFieldKey, subfieldKey] = splitStringOn(fieldKey, '.');
      if (!resultConfig[primaryFieldKey]) {
        resultConfig[primaryFieldKey] = {};
      }
      resultConfig[primaryFieldKey][subfieldKey] = questionCode;
    }
  });

  return resultConfig;
};

export const replaceQuestionCodesWithIdsInNonJson = async (models, config, nonJsonFieldList) => {
  const resultConfig = {};

  await Promise.all(
    Object.entries(config).map(async ([fieldKey, value]) => {
      let newValue = value;
      if (nonJsonFieldList.includes(fieldKey)) {
        const { id: questionId } = await models.question.findOne({ code: value });
        newValue = { questionId };
      }
      resultConfig[fieldKey] = newValue;
    }),
  );

  return resultConfig;
};

export const replaceQuestionCodesWithIdsInJson = async (models, config, jsonFieldList) => {
  const resultConfig = {};

  await Promise.all(
    Object.entries(config).map(async ([fieldKey, value]) => {
      let newValue = value;
      if (jsonFieldList.includes(fieldKey)) {
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
