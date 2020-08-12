/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const FORMULA_SYMBOLS = ['(', ')', '+', '-', '*', '/'];

export const extractDataElementCodesFromFormula = (formula: string) => {
  const regex = `[${FORMULA_SYMBOLS.map(s => `\\${s}`).join('')}]`;
  const codes = formula
    .replace(new RegExp(regex, 'g'), '')
    .split(' ')
    .filter(c => c !== '');

  return new Set(codes);
};

export const expandAggregation = (
  formula: string,
  aggregation: string | Record<string, string>,
) => {
  if (typeof aggregation === 'string') {
    const codes = extractDataElementCodesFromFormula(formula);
    return [...codes].reduce((result, code) => ({ ...result, [code]: aggregation }), {});
  }

  return aggregation;
};
