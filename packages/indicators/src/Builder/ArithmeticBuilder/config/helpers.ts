/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ExpressionParser } from '@tupaia/expression-parser';
import { ArithmeticConfig } from './types';

export const isParameterCode = (parameters: { code: string }[], code: string) =>
  !!parameters.find(p => p.code === code);

export const getDataElementsInFormula = (config: ArithmeticConfig) => {
  const { formula, parameters = [] } = config;

  return new ExpressionParser()
    .getVariables(formula)
    .filter(code => !isParameterCode(parameters, code));
};
