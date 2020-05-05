/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiTable from '@material-ui/core/Table';
import MuiTableBody from '@material-ui/core/TableBody';
import MuiTableCell from '@material-ui/core/TableCell';
import MuiTableHead from '@material-ui/core/TableHead';
import MuiTableSortLabel from '@material-ui/core/TableSortLabel';
import MuiTableRow from '@material-ui/core/TableRow';
import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore';
import MuiTableFooter from '@material-ui/core/TableFooter';
import MuiTablePagination from '@material-ui/core/TablePagination';
import * as COLORS from '../theme/colors';

/**************************************************************************************************
 - TableCells
 **************************************************************************************************/
const TableCell = styled(MuiTableCell)`
  padding: 16px;
  white-space: nowrap;
  font-size: 15px;
  line-height: 18px;
  min-width: 80px;
  color: ${COLORS.TEXT_MIDGREY};

  &:first-child {
    padding-left: 20px;
  }

  &:last-child {
    padding-left: 20px;
  }
`;

const TableCells = ({ columns, data }) =>
  columns.map(({ key, accessor, CellComponent, width = null, align = 'center', cellColor }) => {
    const value = accessor ? React.createElement(accessor, data) : data[key];
    const displayValue = value === 0 ? '0' : value;
    const backgroundColor = typeof cellColor === 'function' ? cellColor(data) : cellColor;
    return (
      // eslint-disable-next-line react/no-array-index-key
      <TableCell background={backgroundColor} key={key} style={{ width: width }} align={align}>
        {CellComponent ? <CellComponent value={displayValue} /> : displayValue}
      </TableCell>
    );
  });

/**************************************************************************************************
 - NestedTable
 **************************************************************************************************/
const StyledTableCell = styled.td`
  background: white;
  padding: 0;
  border: 1px solid ${COLORS.GREY_DE};
  box-sizing: border-box;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
`;

const NestedTable = ({ row, children, columns }) => (
  <MuiTableRow>
    <StyledTableCell colSpan={columns.length}>
      <StyledTable>
        <tbody>{row}</tbody>
      </StyledTable>
      {children}
    </StyledTableCell>
  </MuiTableRow>
);

/**************************************************************************************************
  - Row
 **************************************************************************************************/
const StyledTableRow = styled(MuiTableRow)`
  cursor: pointer;
  border-bottom: 1px solid ${COLORS.GREY_DE};

  &:nth-of-type(even) {
    background: #f1f1f1;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.6);
  }
`;

const ZebraTableRow = styled(MuiTableRow)`
  &:nth-of-type(even) {
    background-color: #efefef;
  }

  .MuiTableCell-root {
    border: none;
  }
`;

const TableRow = React.memo(({ columns, data, SubComponent }) => {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    setExpanded(!expanded);
  };

  const row = (
    <StyledTableRow onClick={handleClick}>
      <TableCells columns={columns} data={data} />
    </StyledTableRow>
  );

  if (SubComponent && expanded) {
    return (
      <NestedTable row={row} columns={columns}>
        <SubComponent rowData={data} />
      </NestedTable>
    );
  }

  return row;
});

const NestedTableRow = React.memo(({ columns, data }) => {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    setExpanded(!expanded);
  };

  return (
    <ZebraTableRow onClick={handleClick}>
      <TableCells columns={columns} data={data} />
    </ZebraTableRow>
  );
});

/**************************************************************************************************
 - Error
 **************************************************************************************************/
const ErrorSpan = styled.span`
  color: #ff0000;
`;

const ErrorRow = React.memo(({ colSpan, children }) => (
  <StyledTableRow>
    <TableCell colSpan={colSpan} align="center">
      {children}
    </TableCell>
  </StyledTableRow>
));

const getErrorMessage = ({ isLoading, errorMessage, data, noDataMessage }) => {
  if (isLoading) return 'Loading...';
  if (errorMessage) return errorMessage;
  if (data.length === 0) return noDataMessage;
  return null;
};

/**************************************************************************************************
 - Body
 **************************************************************************************************/
export const TableBody = ({
  data,
  columns,
  errorMessage,
  isLoading,
  noDataMessage,
  SubComponent,
}) => {
  const error = getErrorMessage({ errorMessage, isLoading, data, noDataMessage });
  if (error) {
    return (
      <MuiTableBody>
        <ErrorRow colSpan={columns.length}>
          {errorMessage ? <ErrorSpan>{error}</ErrorSpan> : error}
        </ErrorRow>
      </MuiTableBody>
    );
  }
  return (
    <MuiTableBody>
      {data.map((rowData, index) => {
        return (
          // eslint-disable-next-line react/no-array-index-key
          <TableRow data={rowData} key={index} columns={columns} SubComponent={SubComponent} />
        );
      })}
    </MuiTableBody>
  );
};

export const NestedTableBody = ({ data, columns, errorMessage, isLoading, noDataMessage }) => {
  const error = getErrorMessage({ errorMessage, isLoading, data, noDataMessage });
  if (error) {
    return (
      <MuiTableBody>
        <ErrorRow colSpan={columns.length}>
          {errorMessage ? <ErrorSpan>{error}</ErrorSpan> : error}
        </ErrorRow>
      </MuiTableBody>
    );
  }
  return (
    <MuiTableBody>
      {data.map((rowData, index) => {
        return (
          // eslint-disable-next-line react/no-array-index-key
          <NestedTableRow data={rowData} key={index} columns={columns} />
        );
      })}
    </MuiTableBody>
  );
};

/**************************************************************************************************
 - Header
 **************************************************************************************************/
const SortLabel = styled(MuiTableSortLabel)`
  flex-direction: row-reverse;
  font-weight: 600;
  font-size: 12px;
  line-height: 14px;
  margin-left: -10px;

  .MuiTableSortLabel-icon {
    opacity: 1;
    margin: 0 2px;
  }
`;

export const TableHeader = ({ columns, order, orderBy, onChangeOrderBy }) => {
  const getContent = (key, sortable, title) =>
    sortable ? (
      <SortLabel
        IconComponent={UnfoldMoreIcon}
        active={orderBy === key}
        direction={order}
        onClick={() => onChangeOrderBy(key)}
      >
        {title}
      </SortLabel>
    ) : (
      title
    );

  return (
    <MuiTableHead>
      <MuiTableRow>
        {columns.map(({ key, title, width = null, align = 'center', sortable = true }) => (
          <TableCell key={key} style={{ width: width }} align={align}>
            {getContent(key, sortable, title)}
          </TableCell>
        ))}
      </MuiTableRow>
    </MuiTableHead>
  );
};

/**************************************************************************************************
 - Paginator
 **************************************************************************************************/
export const TablePaginator = ({
  columns,
  page,
  count,
  rowsPerPage,
  rowsPerPageOptions,
  onChangePage,
  onChangeRowsPerPage,
}) => {
  if (count <= rowsPerPage) {
    return null;
  }

  const handleChangePage = (event, newPage) => {
    if (onChangePage) onChangePage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    if (onChangeRowsPerPage) onChangeRowsPerPage(newRowsPerPage);
  };

  return (
    <MuiTableFooter>
      <MuiTableRow>
        <MuiTablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          colSpan={columns.length}
          page={page}
          count={count}
          rowsPerPage={rowsPerPage}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </MuiTableRow>
    </MuiTableFooter>
  );
};

/**************************************************************************************************
 - Table
 **************************************************************************************************/

export const TableContainer = styled.div`
  margin: 1rem;
`;

export const NestedTableContainer = styled.div`
  margin: 0;
`;

export const StyledTable = styled(MuiTable)`
  border-collapse: unset;
  table-layout: fixed;
`;

// eslint-disable-next-line no-shadow
export const Table = ({ Header, Body, Paginator, ...props }) => {
  return (
    <StyledTable>
      {Header && <Header {...props} />}
      <Body {...props} />
      <Paginator {...props} />
    </StyledTable>
  );
};

Table.propTypes = {
  Header: PropTypes.func,
  Body: PropTypes.func,
  Paginator: PropTypes.func,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.node.isRequired,
      accessor: PropTypes.func,
      sortable: PropTypes.bool,
    }),
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  errorMessage: PropTypes.string,
  noDataMessage: PropTypes.string,
  isLoading: PropTypes.bool,
  count: PropTypes.number,
  onChangePage: PropTypes.func,
  onChangeRowsPerPage: PropTypes.func,
  onChangeOrderBy: PropTypes.func,
  orderBy: PropTypes.string,
  order: PropTypes.string,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  onRowClick: PropTypes.func,
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
};

Table.defaultProps = {
  Header: TableHeader,
  Body: TableBody,
  Paginator: TablePaginator,
  errorMessage: '',
  noDataMessage: 'No data found',
  count: 0,
  isLoading: false,
  onChangePage: null,
  onChangeRowsPerPage: null,
  onChangeOrderBy: null,
  orderBy: null,
  order: 'asc',
  page: null,
  onRowClick: null,
  rowsPerPage: 10,
  rowsPerPageOptions: [10, 25, 50],
};
