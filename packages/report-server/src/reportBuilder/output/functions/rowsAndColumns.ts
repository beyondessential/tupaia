import { TransformTable } from '../../transform';

export const buildRowsAndColumns = () => {
  return (table: TransformTable) => ({
    columns: table.getColumns(),
    rows: table.getRows(),
  });
};
