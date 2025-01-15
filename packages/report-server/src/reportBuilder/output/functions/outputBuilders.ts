import { Resolved } from '@tupaia/types';
import { buildRows } from './rows';
import { buildRowsAndColumns } from './rowsAndColumns';
import { buildMatrix } from './matrix';
import { buildRawDataExport } from './rawDataExport';

export type OutputType = Resolved<
  ReturnType<ReturnType<typeof outputBuilders[keyof typeof outputBuilders]>>
>;

export const outputBuilders = {
  matrix: buildMatrix,
  rawDataExport: buildRawDataExport,
  rowsAndColumns: buildRowsAndColumns,
  rows: buildRows,
  default: buildRows,
};
