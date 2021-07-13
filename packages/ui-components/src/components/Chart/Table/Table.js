/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiTableContainer from '@material-ui/core/TableContainer';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { getIsChartData, getNoDataString } from '../utils';
import { SmallAlert } from '../../Alert';
import { StyledTable } from './StyledTable';
import { FlexStart } from '../../Layout';
import { useChartTable } from './useChartTable';

const TableContainer = styled(MuiTableContainer)`
  overflow: auto;
`;

const NoData = styled(SmallAlert)`
  align-self: center;
  margin-left: auto;
  margin-right: auto;
`;

export const Table = ({ viewContent, className }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    columns,
  } = useChartTable(viewContent);

  if (!getIsChartData(viewContent)) {
    return (
      <NoData severity="info" variant="standard">
        {getNoDataString(viewContent)}
      </NoData>
    );
  }

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
                {row.cells.map(({ getCellProps, render }) => (
                  <TableCell {...getCellProps()}>{render('Cell')}</TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </StyledTable>
    </TableContainer>
  );
};

Table.propTypes = {
  viewContent: PropTypes.shape({
    name: PropTypes.string,
    xName: PropTypes.string,
    periodGranularity: PropTypes.string,
    valueType: PropTypes.string,
    labelType: PropTypes.string,
    chartType: PropTypes.string,
    data: PropTypes.array,
    chartConfig: PropTypes.object,
  }),
  className: PropTypes.string,
};

Table.defaultProps = {
  viewContent: null,
  className: null,
};
