/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ExpressionParser } from '@tupaia/expression-parser';
import {
  allValuesAreNumbers,
  constructIsArrayOf,
  constructIsEmptyOr,
  hasContent,
  isAString,
  isPlainObject,
  ObjectValidator,
} from '@tupaia/utils';
import { validateAggregation } from './aggregationConfig';
import { ArithmeticConfig } from './types';

const assertAllDefaultsAreCodesInFormula = (
  defaultValues: Record<string, unknown>,
  config: ArithmeticConfig,
) => {
  const variables = new ExpressionParser().getVariables(config.formula);
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

export const configValidators = {
  formula: [hasContent, isAString],
  aggregation: [validateAggregation],
  parameters: [constructIsEmptyOr([constructIsArrayOf('object'), validateParameters])],
  defaultValues: [
    constructIsEmptyOr([isPlainObject, assertAllDefaultsAreCodesInFormula, allValuesAreNumbers]),
  ],
};
