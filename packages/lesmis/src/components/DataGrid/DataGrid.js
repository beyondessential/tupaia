/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import { useTable, useFilters } from 'react-table';
import { Table, TableHead, TableRow, TableBody } from '@material-ui/core';
import { TableCell, StyledTableRow } from '@tupaia/ui-components';
import { DefaultColumnFilter } from './DefaultColumnFilter';
import { ColumnFilterCell } from './ColumnFilterCell';

const StyledTable = styled(Table)`
  background: white;
  border: 1px solid ${props => props.theme.palette.grey['400']};
`;

// eslint-disable-next-line react/prop-types
export const DataGrid = ({ data, columns }) => {
  const filterTypes = React.useMemo(
    () => ({
      text: (rows, id, filterValue) => {
        return rows.filter(row => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue).toLowerCase().startsWith(String(filterValue).toLowerCase())
            : true;
        });
      },
    }),
    [],
  );

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter,
    }),
    [],
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      defaultColumn,
      filterTypes,
      columns,
      data,
    },
    useFilters,
  );

  return (
    <StyledTable {...getTableProps()}>
      <TableHead>
        {headerGroups.map(headerGroup => (
          <TableRow {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <TableCell {...column.getHeaderProps()}>{column.render('Header')}</TableCell>
            ))}
          </TableRow>
        ))}
        {headerGroups.map(headerGroup => (
          <TableRow {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <ColumnFilterCell key={column.id} column={column} />
            ))}
          </TableRow>
        ))}
      </TableHead>
      <TableBody {...getTableBodyProps()}>
        {rows.map(row => {
          prepareRow(row);
          return (
            <StyledTableRow {...row.getRowProps()}>
              {row.cells.map(cell => {
                return <TableCell {...cell.getCellProps()}>{cell.render('Cell')}</TableCell>;
              })}
            </StyledTableRow>
          );
        })}
      </TableBody>
    </StyledTable>
  );
};
