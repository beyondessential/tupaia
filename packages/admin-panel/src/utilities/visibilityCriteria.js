export const checkVisibilityCriteriaAreMet = (visibilityCriteria, values) => {
  if (!visibilityCriteria) {
    return true; // no visibility criteria to meet, fine to display
  }
  return Object.entries(visibilityCriteria).every(([parameterKey, requiredValue]) => {
    if (typeof requiredValue === 'function') return requiredValue(values, parameterKey);
    return values[parameterKey] === requiredValue;
  });
};
