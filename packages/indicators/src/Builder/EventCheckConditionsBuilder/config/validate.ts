/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { constructIsEmptyOrSync, hasContent, isAString, isPlainObject } from '@tupaia/utils';
import {
  assertAllDefaultsAreCodesInFormula,
  assertDefaultValuesHaveAllowedTypesOrUndefined,
} from '../../validators';

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
