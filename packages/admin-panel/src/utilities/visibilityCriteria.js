/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export const checkVisibilityCriteriaAreMet = (visibilityCriteria, values) => {
  if (!visibilityCriteria) {
    return true; // no visibility criteria to meet, fine to display
  }
  return Object.entries(visibilityCriteria).every(([parameterKey, requiredValue]) => {
    if (typeof requiredValue === 'function') return requiredValue(values, parameterKey);
    return values[parameterKey] === requiredValue;
  });
};
