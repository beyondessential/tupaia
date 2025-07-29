import { merge } from 'es-toolkit/compat';
import { splitStringOn } from './split';

/**
 *  Converts a flat object
 *  into a nested object.
 *  e.g.
 *  {
 *    createConfig: true,
 *    'fields.type': 'facility'
 *  }
 *  =>
 *  {
 *    createConfig: true,
 *    fields: {
 *      type: 'facility'
 *    }
 *  }
 */

export const nestConfig = config => {
  let resultConfig = {};

  Object.entries(config).forEach(([rawFieldKey, rawFieldValue]) => {
    const keys = splitStringOn(rawFieldKey, '.');
    const nestedField = nestFieldRecursively(keys, rawFieldValue);
    resultConfig = merge(resultConfig, nestedField);
  });

  return resultConfig;
};

const nestFieldRecursively = (keys, value, depth = 0) => {
  if (depth === keys.length - 1) {
    return { [keys[depth]]: value };
  }
  return {
    [keys[depth]]: nestFieldRecursively(keys, value, depth + 1),
  };
};

export const translateQuestionCodeToId = async (questionModel, code) => {
  const question = await questionModel.findOne({ code });
  return { questionId: question.id };
};
