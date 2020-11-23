/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getVariables } from '@beyondessential/arithmetic';

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

const assertAllDefaultsAreCodesInFormula = (
  defaultValues: Record<string, unknown>,
  { formula }: { formula: string },
) => {
  const variables = getVariables(formula);
  Object.keys(defaultValues).forEach(code => {
    if (!variables.includes(code)) {
      throw new Error(`'${code}' is in defaultValues but not referenced in the formula`);
    }
  });
};

const validateParameters = async (parameters: Record<string, unknown>[]) => {
  const validator = new ObjectValidator({
    code: [hasContent, isAString],
    builder: [hasContent, isAString],
    config: [isPlainObject],
  });

  const validateParameter = async (parameter: Record<string, unknown>) =>
    validator.validate(parameter);
  await Promise.all(parameters.map(validateParameter));
};

export const configValidators = {
  formula: [hasContent, isAString],
  aggregation: [validateAggregation],
  parameters: [constructIsEmptyOr([constructIsArrayOf('object'), validateParameters])],
  defaultValues: [
    constructIsEmptyOr([isPlainObject, assertAllDefaultsAreCodesInFormula, allValuesAreNumbers]),
  ],
};
