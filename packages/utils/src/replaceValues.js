/**
 * Replaces all variables in `target` with a corresponding value defined in `replacements`
 * Variables are marked by curly braces (e.g. "{replaceThis}")
 *
 * @param {(string|Object)} target
 * @param {Object} replacements
 * @returns {(string|Object)}
 */
export const replaceValues = (target, replacements) => {
  if (!replacements || Object.keys(replacements).length === 0) {
    return target;
  }

  const isString = typeof target === 'string';

  let replacedString = isString ? target : JSON.stringify(target);
  Object.entries(replacements).forEach(([key, value]) => {
    if (replacedString.indexOf(`{${key}}`) !== -1) {
      replacedString = replacedString.replace(new RegExp(`\{${key}\}`, 'g'), value);
    }
  });
  return isString ? replacedString : JSON.parse(replacedString);
};
