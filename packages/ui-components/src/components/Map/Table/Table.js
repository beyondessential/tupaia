/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TableBody from '@material-ui/core/TableBody';
import { StyledTable } from './StyledTable';
import { FlexStart } from '../../Layout';
import { useMapTable } from './useMapTable';

export const Table = ({ serieses, measureData, className }) => {
  const { getTableProps, getTableBodyProps, headerGroups, prepareRow, rows, columns } = useMapTable(
    serieses,
    measureData,
  );

  return (
    <TableContainer className={className}>
      <StyledTable {...getTableProps()} style={{ minWidth: columns.length * 140 + 250 }}>
        <TableHead>
          {headerGroups.map(({ getHeaderGroupProps, headers }) => (
            <TableRow {...getHeaderGroupProps()}>
              {headers.map(
                ({ getHeaderProps, getSortByToggleProps, isSorted, isSortedDesc, render }) => (
                  <TableCell {...getHeaderProps(getSortByToggleProps())}>
                    <FlexStart>
                      {render('Header')}
                      <TableSortLabel active={isSorted} direction={isSortedDesc ? 'asc' : 'desc'} />
                    </FlexStart>
                  </TableCell>
                ),
              )}
            </TableRow>
          ))}
        </TableHead>
        <TableBody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <TableRow {...row.getRowProps()}>
                {row.cells.map(({ getCellProps, render }) => {
                  return <TableCell {...getCellProps()}>{render('Cell')}</TableCell>;
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </StyledTable>
    </TableContainer>
  );
};

Table.propTypes = {
  measureData: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
    }),
  ),
  serieses: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ),
  className: PropTypes.string,
};

Table.defaultProps = {
  measureData: [],
  serieses: [],
  className: null,
};
