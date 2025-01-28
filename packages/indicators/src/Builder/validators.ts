import { getExpressionParserInstance } from '../getExpressionParserInstance';

export const assertDefaultValuesHaveAllowedTypesOrUndefined = (
  defaultValues: Record<string, unknown>,
  allowedTypes: string[],
) => {
  Object.entries(defaultValues).forEach(([code, value]) => {
    if (!allowedTypes.includes(typeof value) && value !== 'undefined') {
      throw new Error(
        `Value '${code}' in defaultValues is not in allowed types (${allowedTypes.toString()}) or 'undefined': ${value}`,
      );
    }
  });
};

export const assertAllDefaultsAreCodesInFormula = (
  defaultValues: Record<string, unknown>,
  config: Record<string, unknown>,
) => {
  const parser = getExpressionParserInstance();
  const variables = parser.getVariables(config.formula);
  Object.keys(defaultValues).forEach(code => {
    if (!variables.includes(code)) {
      throw new Error(`'${code}' is in defaultValues but not referenced in the formula`);
    }
  });
};
