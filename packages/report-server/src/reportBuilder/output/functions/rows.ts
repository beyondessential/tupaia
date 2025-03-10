import { TransformTable } from '../../transform';

export const buildRows = () => {
  return (table: TransformTable) => table.getRows();
};
