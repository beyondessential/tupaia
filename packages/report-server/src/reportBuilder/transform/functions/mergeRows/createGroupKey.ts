/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Row } from '../../../types';
import { buildRowKey } from '../utils';

export const buildCreateGroupKey = (groupBy: undefined | string | string[]) => {
  return (row: Row) => {
    if (groupBy === undefined) {
      return '*';
    }

    if (typeof groupBy === 'string') {
      return `${row[groupBy]}`;
    }

    return buildRowKey(row, groupBy);
  };
};
