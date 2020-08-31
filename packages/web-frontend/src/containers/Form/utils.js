/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * Aggregates form fields and returns an object representing their values
 * Values can be nested by separating each level with '.'
 * Eg.input:
 * {
 *   'entityIds.5a8cde073ec0d40a17295255': true,
 *   'entityIds.59085f69fc6a0715dae508f6': false,
 * }
 *
 * Output:
 * {
 *   entityIds: {
 *     5a8cde073ec0d40a17295255: true
 *     59085f69fc6a0715dae508f6: false
 *   }
 * }
 *
 *
 * @param {object} fields
 */
export const aggregateFields = fields => {
  const aggregatedFields = {};

  Object.keys(fields).forEach(key => {
    const value = fields[key];
    const subKeys = key.split('.');

    let pointer = aggregatedFields;
    // Traverse through each subKey and create object structure
    subKeys.slice(0, -1).forEach(subKey => {
      if (!pointer[subKey]) {
        pointer[subKey] = {};
      }
      pointer = pointer[subKey];
    });

    pointer[subKeys.slice(-1)] = value;
  });

  return aggregatedFields;
};

export const validateField = (fields, fieldProps) => {
  const { name, required, validators = [] } = fieldProps;
  const errors = validators
    .map(validator => {
      if (!fields[name]) return null;
      if (validator.validate(fields[name], fields) === false) return validator.error;
      return null;
    })
    .filter(e => e);

  if (required && !fields[name]) errors.push('Required field');
  return errors;
};
