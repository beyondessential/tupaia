/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';
import { Row } from '../../../types';

export const createJoin = (joinConfig?: { tableColumn: string; newDataColumn: string }) => (
  tableRows: Row[],
  newDataRows: Row[],
) => {
  if (!joinConfig) {
    return tableRows.concat(newDataRows);
  }

  const { tableColumn, newDataColumn } = joinConfig;
  const tableRowsByJoinColumn = groupBy(tableRows, tableColumn);
  const newDataRowsByJoinColumn = groupBy(newDataRows, newDataColumn);
  const jointRows = Object.entries(tableRowsByJoinColumn)
    .map(([joinColumnValue, tableRowsForValue]) => {
      const newDataRowsForValue = newDataRowsByJoinColumn[joinColumnValue];
      if (!newDataRowsForValue) {
        return tableRowsForValue;
      }

      return tableRowsForValue
        .map(tableRowForValue =>
          newDataRowsForValue.map(newDataRowForValue => ({
            ...tableRowForValue,
            ...newDataRowForValue,
          })),
        )
        .flat();
    })
    .flat();

  return jointRows;
};
