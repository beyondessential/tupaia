import { parseParams } from '../../functions';

export const drop = (rows, params) => {
  return rows.map(row => {
    const columnToDrop = parseParams(row, params);
    const { [columnToDrop]: deletedColumn, ...restOfRow } = row;
    return restOfRow;
  });
};
