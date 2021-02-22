/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { constructIsEmptyOrSync, hasContent, isAString, isPlainObject } from '@tupaia/utils';
import { getExpressionParserInstance } from '../../../getExpressionParserInstance';
import { assertDefaultValuesHaveAllowedTypesOrUndefined } from '../../validators';
import { CountEventConfig } from './types';

const assertAllDefaultsAreCodesInFormula = (
  defaultValues: Record<string, unknown>,
  config: CountEventConfig,
) => {
  const parser = getExpressionParserInstance();
  const variables = parser.getVariables(config.formula);
  Object.keys(defaultValues).forEach(code => {
    if (!variables.includes(code)) {
      throw new Error(`'${code}' is in defaultValues but not referenced in the formula`);
    }
  });
};

const assertDefaultValuesHaveAppropriateTypes = (defaultValues: Record<string, unknown>) => {
  assertDefaultValuesHaveAllowedTypesOrUndefined(defaultValues, ['number', 'string']);
};

export const configValidators = {
  formula: [hasContent, isAString],
  programCode: [hasContent, isAString],
  defaultValues: [
    constructIsEmptyOrSync([
      isPlainObject,
      assertAllDefaultsAreCodesInFormula,
      assertDefaultValuesHaveAppropriateTypes,
    ]),
  ],
};
