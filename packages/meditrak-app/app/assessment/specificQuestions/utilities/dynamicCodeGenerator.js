import { generateShortId, SHORT_ID } from '../../../utilities';

// Resolve the prefix from an entity's fields/attributes, or its name by default.
export const resolvePrefix = (entity, dynamicPrefix) => {
  const { entityField, entityAttribute } = dynamicPrefix;
  if (entityField) return entity[entityField];
  if (entityAttribute) return entity.attributes && entity.attributes[entityAttribute];
  return entity.name;
};

// Extract the random tail of a generated code, i.e. "EBN-HM8-Z1N-CJV0" -> "HM8-Z1N-CJV0".
export const extractTrailingCode = (code, prefix) => {
  const expectedPrefix = `${prefix}-`;
  if (!code.startsWith(expectedPrefix)) {
    throw new Error(
      `Generated code "${code}" does not start with expected prefix "${expectedPrefix}"`,
    );
  }
  return code.slice(expectedPrefix.length);
};

// Determine the code to use for the current prefix, reusing the random tail when only the
// prefix changed so switching the source answer doesn't churn the whole code.
export const resolveCode = ({ resolvedPrefix, existingCode, trailingCode, codeGenerator }) => {
  if (codeGenerator.type !== SHORT_ID) {
    throw new Error(
      `dynamicPrefix is only supported with shortid code generators, got: ${codeGenerator.type}`,
    );
  }

  // Existing/draft code already matches this prefix — keep it
  if (existingCode && existingCode.startsWith(`${resolvedPrefix}-`)) {
    return { code: existingCode, trailingCode: extractTrailingCode(existingCode, resolvedPrefix) };
  }

  // Prefix changed but we still have the random tail — just swap the prefix
  if (trailingCode) {
    return { code: `${resolvedPrefix}-${trailingCode}`, trailingCode };
  }

  // First generation — create a whole new code
  const newCode = generateShortId({ codeGenerator: { ...codeGenerator, prefix: resolvedPrefix } });
  return { code: newCode, trailingCode: extractTrailingCode(newCode, resolvedPrefix) };
};
