/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Row } from '../../../types';

export const buildCreateGroupKey = (groupBy: undefined | string | string[]) => {
  return (row: Row) => {
    if (groupBy === undefined) {
      return '*';
    }

    if (typeof groupBy === 'string') {
      return `${row[groupBy]}`;
    }

    return groupBy.map(columnName => row[columnName]).join('___');
  };
};
