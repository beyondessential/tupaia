/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Row } from '../../../types';

const divider = '___';

export const rowValuesKey = (row: Row, columnsOfInterest?: string[]) => {
  if (columnsOfInterest) {
    return columnsOfInterest.map(columnName => row[columnName]).join(divider);
  }
  return Object.values(row).sort().join(divider);
};
