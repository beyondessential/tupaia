/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  constructIsArrayOf,
  constructIsEmptyOr,
  hasContent,
  isAString,
  isPlainObject,
  ObjectValidator,
} from '@tupaia/utils';
import { getExpressionParserInstance } from '../../../getExpressionParserInstance';
import { validateConfig } from '../../helpers';
import { validateAggregation } from './aggregation';
import { ArithmeticConfig } from './types';

const assertAllDefaultsAreCodesInFormula = (
  defaultValues: Record<string, unknown>,
  config: ArithmeticConfig,
) => {
  const parser = getExpressionParserInstance();
  const variables = parser.getVariables(config.formula);
  Object.keys(defaultValues).forEach(code => {
    if (!variables.includes(code)) {
      throw new Error(`'${code}' is in defaultValues but not referenced in the formula`);
    }
  });
};

const parameterValidator = new ObjectValidator({
  code: [hasContent, isAString],
  builder: [hasContent, isAString],
  config: [isPlainObject],
});

const validateParameters = async (parameters: Record<string, unknown>[]) =>
  Promise.all(
    parameters.map(async (parameter: Record<string, unknown>) =>
      parameterValidator.validate(parameter),
    ),
  );

const assertDefaultValuesAreNumbersOrUndefined = (defaultValues: Record<string, unknown>) => {
  Object.entries(defaultValues).forEach(([code, value]) => {
    if (typeof value !== 'number' && value !== 'undefined') {
      throw new Error(`Value '${code}' in defaultValues is not a number or 'undefined': ${value}`);
    }
  });
};

export const configValidators = {
  formula: [hasContent, isAString],
  aggregation: [validateAggregation],
  parameters: [constructIsEmptyOr([constructIsArrayOf('object'), validateParameters])],
  defaultValues: [
    constructIsEmptyOr([
      isPlainObject,
      assertAllDefaultsAreCodesInFormula,
      assertDefaultValuesAreNumbersOrUndefined,
    ]),
  ],
};

export const validateArithmeticConfig = (
  config: Record<string, unknown>,
): Promise<ArithmeticConfig> => validateConfig<ArithmeticConfig>(config, configValidators);
