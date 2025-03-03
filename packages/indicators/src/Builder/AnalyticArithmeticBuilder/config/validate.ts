import {
  constructIsArrayOf,
  constructIsEmptyOrSync,
  hasContent,
  isAString,
  isPlainObject,
  ObjectValidator,
} from '@tupaia/utils';
import {
  assertAllDefaultsAreCodesInFormula,
  assertDefaultValuesHaveAllowedTypesOrUndefined,
} from '../../validators';
import { validateAggregation } from './aggregation';

const parameterValidator = new ObjectValidator({
  code: [hasContent, isAString],
  builder: [hasContent, isAString],
  config: [isPlainObject],
});

const validateParameters = (parameters: Record<string, unknown>[]) =>
  parameters.forEach(p => parameterValidator.validateSync(p));

const assertDefaultValuesHaveAppropriateTypes = (defaultValues: Record<string, unknown>) => {
  assertDefaultValuesHaveAllowedTypesOrUndefined(defaultValues, ['number']);
};

export const configValidators = {
  formula: [hasContent, isAString],
  aggregation: [validateAggregation],
  parameters: [constructIsEmptyOrSync([constructIsArrayOf('object'), validateParameters])],
  defaultValues: [
    constructIsEmptyOrSync([
      isPlainObject,
      assertAllDefaultsAreCodesInFormula,
      assertDefaultValuesHaveAppropriateTypes,
    ]),
  ],
};
