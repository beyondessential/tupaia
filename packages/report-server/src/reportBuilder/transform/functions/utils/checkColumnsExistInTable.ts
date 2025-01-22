import { TransformTable } from '../../table';

export const checkColumnsExistInTable = (
  columns: string[],
  table: TransformTable,
  errorPrefix?: string,
) => {
  const columnsMissingFromTable = columns.filter(column => !table.hasColumn(column));
  if (columnsMissingFromTable.length > 0) {
    throw new Error(
      `${
        errorPrefix ? `${errorPrefix} ` : ''
      }Columns do not exist in the table: ${columnsMissingFromTable}`,
    );
  }
};
