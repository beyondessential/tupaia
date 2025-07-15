import { yup } from '@tupaia/utils';
import { starSingleOrMultipleColumnsValidator } from './utils';
import { getColumnMatcher } from './helpers';
import { TransformTable } from '../table';
import { TransformBuilder } from '.';

type ExcludeColumnsParams = {
  shouldIncludeColumn: (field: string) => boolean;
};

export const paramsValidator = yup.object().shape({
  columns: starSingleOrMultipleColumnsValidator,
});

const excludeColumns = (table: TransformTable, params: ExcludeColumnsParams) => {
  const columnsToDelete = table
    .getColumns()
    .filter(columnName => !params.shouldIncludeColumn(columnName));

  return table.dropColumns(columnsToDelete);
};

const buildParams = (params: unknown): ExcludeColumnsParams => {
  const { columns } = paramsValidator.validateSync(params);
  if (!columns) {
    throw new Error('columns must be defined');
  }

  const columnMatcher = getColumnMatcher(columns);
  const shouldIncludeColumn = (column: string) => !columnMatcher(column);

  return { shouldIncludeColumn };
};

export const buildExcludeColumns: TransformBuilder = (params, _context) => {
  const builtParams = buildParams(params);
  return table => excludeColumns(table, builtParams);
};
