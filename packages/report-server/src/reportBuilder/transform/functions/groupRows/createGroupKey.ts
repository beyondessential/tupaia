/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Row } from '../../../types';

export const buildCreateGroupKey = (by: undefined | string | string[]) => {
  return (row: Row) => {
    if (by === undefined) {
      return '*';
    }

    if (typeof by === 'string') {
      return `${row[by]}`;
    }

    return by.map(field => row[field]).join('___');
  };
};
