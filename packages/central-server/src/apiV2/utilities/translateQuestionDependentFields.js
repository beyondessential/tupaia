import { splitStringOn, splitStringOnComma } from './split';

/**
 * Dictionary of entity creation fields used in the input
 * to the keys that will be used in the output
 */
const ENTITY_FIELD_TRANSLATION = {
  parent: 'parentId',
  grandparent: 'grandparentId',
};

// Subfields will be in the format field.subfield, e.g. 'attributes.type'
const isNested = (nestedFieldList, fieldKey) =>
  nestedFieldList.find(field => fieldKey.startsWith(field));

const translateNestedField = (rawFieldKey, rawFieldValue) => {
  const splitField = splitStringOn(rawFieldKey, '.');

  if (splitField.length === 3) {
    const [, midLevelKey, lowerLevelKey] = splitField;
    return { primaryKey: midLevelKey, lowerLevelKey, rawFieldValue };
  }

  const [primaryKey, fieldKey] = splitField;
  return {
    primaryKey,
    processedFieldKey: ENTITY_FIELD_TRANSLATION[fieldKey] || fieldKey,
    processedFieldValue: rawFieldValue.includes(',')
      ? splitStringOnComma(rawFieldValue)
      : rawFieldValue,
  };
};

export const translateQuestionDependentNestedFields = (config, nestedFieldList) => {
  const resultConfig = {};

  Object.entries(config).forEach(([rawFieldKey, rawFieldValue]) => {
    if (isNested(nestedFieldList, rawFieldKey)) {
      if (!resultConfig[rawFieldKey]) {
        resultConfig[rawFieldKey] = {};
      }
      const { primaryKey, processedFieldKey, processedFieldValue } = translateNestedField(
        rawFieldKey,
        rawFieldValue,
      );
      if (!nestedFieldList.includes(primaryKey)) {
        resultConfig[primaryKey] = {
          ...resultConfig[primaryKey],
          processedFieldKey: processedFieldValue,
        };
      }
      resultConfig[processedFieldKey] = processedFieldValue;
    }
  });

  return resultConfig;
};

/**
 * { question_code: "RHS1UNFPA68" } => { question_id: "5e01604261f76a4835c6600c" }
 */
export const translateQuestionCodeToId = async (questionModel, code) => {
  const question = await questionModel.findOne({ code });
  return { question_id: question.id };
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
          const [subfieldKey, subfieldValue] = Object.entries(value)[i];
          if (subfieldKey === 'type') {
            continue;
          } else if (subfieldKey === 'attributes') {
            let newAttributesFieldValue = {};
            const attributesSubfields = Object.entries(subfieldValue);
            for (let k = 0; k < attributesSubfields.length; k++) {
              const [attributesSubfieldKey, attributesSubfieldValue] = attributesSubfields[k];
              const { question_id: questionId } = await translateQuestionCodeToId(
                models.question,
                attributesSubfieldValue,
              );
              newAttributesFieldValue = {
                ...newAttributesFieldValue,
                [attributesSubfieldKey]: { questionId },
              };
            }
            newValue = {
              ...newValue,
              attributes: newAttributesFieldValue,
            };
          } else {
            const { question_id: questionId } = await translateQuestionCodeToId(
              models.question,
              subfieldValue,
            );
            newValue = {
              ...newValue,
              [subfieldKey]: { questionId },
            };
          }
        }
      }

      resultConfig[fieldKey] = newValue;
    }),
  );

  return resultConfig;
};
