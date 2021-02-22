/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export const assertDefaultValuesHaveAllowedTypesOrUndefined = (
  defaultValues: Record<string, unknown>,
  allowedTypes: string[],
) => {
  Object.entries(defaultValues).forEach(([code, value]) => {
    if (!allowedTypes.includes(typeof value) && value !== 'undefined') {
      throw new Error(
        `Value '${code}' in defaultValues is not in types ${allowedTypes.toString()} or 'undefined': ${value}`,
      );
    }
  });
};
