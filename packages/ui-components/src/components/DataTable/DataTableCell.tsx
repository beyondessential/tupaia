import React from 'react';
import { TableCell, TableCellProps } from '@material-ui/core';

const getDataType = (value: any): string => (value === null ? 'null' : typeof value);

const formatValue = (value: any): string => {
  const type = getDataType(value);
  switch (type) {
    case 'null':
      return 'NULL';
    case 'object':
      return JSON.stringify(value);
    case 'function':
      return '[Function]';
    default:
      return `${value}`;
  }
};

export const DataTableCell = ({
  value,
  ...props
}: TableCellProps & {
  value: number | string | boolean | Object | Function;
}) => {
  return (
    <TableCell {...props} className={`data-type-${getDataType(value)}`}>
      {formatValue(value)}
    </TableCell>
  );
};
