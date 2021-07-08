/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useMemo } from 'react';
import { useTable, useSortBy } from 'react-table';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TableBody from '@material-ui/core/TableBody';
import { StyledTable } from './StyledTable';
import { getFormattedInfo } from '../../utils/measures';
import { FlexStart } from '../../components/Flexbox';

const processColumns = measureOptions => {
  const columns = measureOptions.map(column => {
    return { accessor: column.key, Header: column.name };
  });

  return [
    { accessor: 'name', Header: 'Name' },
    ...columns,
    { accessor: 'submissionDate', Header: 'Submission Date' },
  ];
};

const processData = (measureOptions, measureData) => {
  return measureData.map(row => {
    const columns = measureOptions.reduce((cols, measureOption) => {
      const value = getFormattedInfo(row, measureOption).formattedValue;
      return { ...cols, [measureOption.key]: value };
    }, {});

    return {
      name: row.name,
      ...columns,
      submissionDate: row.submissionDate ?? 'No data',
    };
  });
};

export const MapTable = ({ measureOptions, measureData }) => {
  const columns = useMemo(() => processColumns(measureOptions), []);
  const data = useMemo(() => processData(measureOptions, measureData), []);

  const { getTableProps, getTableBodyProps, headerGroups, prepareRow, rows } = useTable(
    {
      columns,
      data,
    },
    useSortBy,
  );

  return (
    <TableContainer>
      <StyledTable {...getTableProps()}>
        <TableHead>
          {headerGroups.map(headerGroup => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <TableCell {...column.getHeaderProps(column.getSortByToggleProps())}>
                  <FlexStart>
                    {column.render('Header')}
                    <TableSortLabel
                      active={column.isSorted}
                      direction={column.isSortedDesc ? 'asc' : 'desc'}
                    />
                  </FlexStart>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <TableRow {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return <TableCell {...cell.getCellProps()}>{cell.render('Cell')}</TableCell>;
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </StyledTable>
    </TableContainer>
  );
};
