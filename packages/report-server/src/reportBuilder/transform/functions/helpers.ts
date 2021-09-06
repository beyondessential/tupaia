/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { TransformParser } from '../parser';

export const getColumnMatcher = (columnsToMatch: '*' | string | string[]) => {
  if (columnsToMatch === '*') {
    return () => true;
  }

  if (typeof columnsToMatch === 'string') {
    return (field: string) => field === columnsToMatch;
  }

  return (field: string) => columnsToMatch.includes(field);
};

export const getParsedColumnKeyAndValue = (
  key: string,
  valueExpression: string,
  parser: TransformParser,
) => {
  const newKey = key.startsWith('=') ? `${parser.evaluate(key.substring(1))}` : key;
  const newValue = parser.evaluate(valueExpression);
  return [newKey, newValue];
};
