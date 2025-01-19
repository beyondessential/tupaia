import groupBy from 'lodash.groupby';
import { Row } from '../../../types';

const createKey = (keyFields: string[]) => (object: Record<string, unknown>) =>
  keyFields.map(field => object[field]).join('||');

export const createJoin = (joinConfig?: { tableColumn: string; newDataColumn: string }[]) => (
  tableRows: Row[],
  newDataRows: Row[],
) => {
  if (!joinConfig || joinConfig.length === 0) {
    return tableRows.concat(newDataRows);
  }

  const tableColumns = joinConfig.map(({ tableColumn }) => tableColumn);
  const newDataColumns = joinConfig.map(({ newDataColumn }) => newDataColumn);
  const tableRowsByJoinColumn = groupBy(tableRows, createKey(tableColumns));
  const newDataRowsByJoinColumn = groupBy(newDataRows, createKey(newDataColumns));
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
