import { splitStringOn, splitStringOnComma } from './split';

/**
 * Dictionary of entity creation fields used in the input
 * to the keys that will be used in the output
 */
const ENTITY_FIELD_TRANSLATION = {
  name: 'name',
  code: 'code',
  parent: 'parentId',
  grandparent: 'grandparentId',
};

// Subfields will be in the format field.subfield, e.g. 'attributes.type'
const isSubfield = (nestedFieldList, fieldKey) =>
  nestedFieldList.find(field => fieldKey.startsWith(field));

export const translateQuestionDependentNestedFields = (config, nestedFieldList) => {
  const resultConfig = {};

  Object.entries(config).forEach(([fieldKey, questionCode]) => {
    if (isSubfield(nestedFieldList, fieldKey)) {
      const [primaryFieldKey, subfieldKey] = splitStringOn(fieldKey, '.');
      if (!resultConfig[primaryFieldKey]) {
        resultConfig[primaryFieldKey] = {};
      }

      // Convert to array if type key in filter object
      if (primaryFieldKey === 'filter' && subfieldKey === 'type') {
        resultConfig[primaryFieldKey][subfieldKey] = splitStringOnComma(questionCode);
      } else if (subfieldKey === 'attributes') {
        // split string again for attributes field, as it is double nested
        const [attributesKey, attributesSubfieldKey] = splitStringOn(subfieldKey);
        if (!resultConfig[primaryFieldKey][attributesKey]) {
          resultConfig[primaryFieldKey][attributesKey] = {};
        }
        resultConfig[primaryFieldKey][attributesKey][attributesSubfieldKey] = questionCode;
      } else {
        const outputSubfieldKey = ENTITY_FIELD_TRANSLATION[subfieldKey] || subfieldKey;
        resultConfig[primaryFieldKey][outputSubfieldKey] = questionCode;
      }
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
  console.log('config, nestedFieldList line 63', config, nestedFieldList);
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
  console.log('result config', resultConfig);
  return resultConfig;
};
