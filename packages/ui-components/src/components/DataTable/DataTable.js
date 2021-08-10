/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useImperativeHandle, useRef } from 'react';
import PropTypes from 'prop-types';
import xlsx from 'xlsx';
import sanitize from 'sanitize-filename';
import moment from 'moment';
import { useTable, useSortBy } from 'react-table';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TableBody from '@material-ui/core/TableBody';

import { StyledTable } from './StyledTable';
import { FlexStart } from '../Layout';

export const truncate = (str, num, ellipsis = false) => {
  if (str.length <= num) {
    return str;
  }
  return ellipsis ? `${str.slice(0, num)}...` : str.slice(0, num);
};

export const stringToFilename = string => {
  const sanitized = sanitize(string).replace(/\s+/g, '-').toLowerCase().toLowerCase();
  return truncate(sanitized, 255);
};

const formatDataForExport = (data, columns) => {};

export const DataTable = React.forwardRef(({ columns, data, className }, ref) => {
  const tableRef = useRef();

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    columns: columnsData,
  } = useTable(
    {
      columns,
      data,
    },
    useSortBy,
  );

  useImperativeHandle(ref, () => ({
    exportData(title) {
      const sheet = xlsx.utils.json_to_sheet(data);
      const date = moment().format('Do MMM YY');
      const sheetName = `Export on ${date}`;
      const workbook = { SheetNames: [sheetName], Sheets: { [sheetName]: sheet } };
      const fileName = title ? stringToFilename(`export-${title}-${date}`) : `export-${date}.xlsx`;
      console.log('fileName', fileName);
      // xlsx.writeFile(workbook, fileName);
    },
  }));

  return (
    <TableContainer className={className}>
      <StyledTable
        {...getTableProps()}
        style={{ minWidth: columnsData.length * 140 + 250 }}
        ref={tableRef}
      >
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
});

DataTable.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  className: PropTypes.string,
};

DataTable.defaultProps = {
  className: null,
};
