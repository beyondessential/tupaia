import { Row } from '../../../types';

const divider = '___';

export const buildRowKey = (row: Row, columnsOfInterest?: string[]) => {
  if (columnsOfInterest) {
    return columnsOfInterest.map(columnName => row[columnName]).join(divider);
  }
  return Object.values(row).sort().join(divider);
};
