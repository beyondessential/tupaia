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
  for (const [variable, replacement] of Object.entries(replacements)) {
    // Literal match and replacer function, so neither is interpreted as a pattern
    replacedString = replacedString.replaceAll(`{${variable}}`, () => replacement);
  }
  return isString ? replacedString : JSON.parse(replacedString);
};
