/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';
import { TransformTable } from '../table';
import { Row } from '../../types';
import { getColumnMatcher } from './helpers';
import { gatherColumnsValidator } from './transformValidators';

type GatherColumnsParams = {
  shouldKeepColumn: (field: string) => boolean;
};

export const paramsValidator = yup.object().shape({
  keep: gatherColumnsValidator,
});

const gatherColumns = (table: TransformTable, params: GatherColumnsParams) => {
  const { shouldKeepColumn } = params;

  const columnNames = table.getColumns();
  const columnsToKeep = columnNames.filter(columnName => shouldKeepColumn(columnName));
  const columnsToGather = columnNames.filter(columnName => !shouldKeepColumn(columnName));
  const newColumnNames = [...columnsToKeep, 'value', 'columnName'];

  const newRowData = table
    .getRows()
    .map(row => {
      const keptData: Row = Object.fromEntries(
        columnsToKeep.map(columnName => [columnName, row[columnName]]),
      );

      return columnsToGather.map(columnName => ({
        ...keptData,
        value: row[columnName],
        columnName,
      }));
    })
    .flat();

  return new TransformTable(newColumnNames, newRowData);
};

const buildParams = (params: unknown): GatherColumnsParams => {
  const validatedParams = paramsValidator.validateSync(params);

  const { keep } = validatedParams;
  const policyColumns = keep || [];

  const columnMatcher = getColumnMatcher(policyColumns);
  const shouldKeepColumn = (column: string) => columnMatcher(column);

  return {
    shouldKeepColumn,
  };
};

export const buildGatherColumns = (params: unknown) => {
  const builtParams = buildParams(params);
  return (table: TransformTable) => gatherColumns(table, builtParams);
};
