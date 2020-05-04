/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MaterialTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';

export const Colors = {
  primary: '#326699',
  primaryDark: '#2f4358',
  secondary: '#ffcc24',
  alert: '#f76853',
  safe: '#47ca80',
  darkestText: '#444444',
  darkText: '#666666',
  midText: '#888888',
  softText: '#b8b8b8',
  outline: '#dedede',
  background: '#f3f5f7',
  white: '#ffffff',
  offWhite: '#fafafa',
  brightBlue: '#67A6E3',
  searchTintColor: '#d2dae3',
};

const CellErrorMessage = styled.div`
  display: block;
  background: red;
  width: 100%;
  height: 100%;
  color: white;
  cursor: pointer;
`;

const DEFAULT_ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const StyledTableRow = styled(TableRow)`
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.6);
  }
`;

const StyledTableContainer = styled.div`
  margin: 1rem;
`;

const StyledTableCell = styled(TableCell)`
  padding: 16px;
  background: ${props => props.background};
`;

const StyledTable = styled(MaterialTable)`
  border: 1px solid ${Colors.outline};
  border-radius: 3px 3px 0 0;
  border-collapse: unset;
  background: ${Colors.white};

  &:last-child {
    border-bottom: none;
  }
`;

const StyledTableHead = styled(TableHead)`
  background: ${Colors.background};
`;

const StyledTableFooter = styled(TableFooter)`
  background: ${Colors.background};
`;

const NestedTable = ({ row, children }) => (
  <StyledTableRow>
    <td colSpan="4">
      <table style={{ width: '100%' }}>
        <tbody>{row}</tbody>
      </table>
      {children}
    </td>
  </StyledTableRow>
);

/*
 * Row
 */
const Row = React.memo(({ columns, data, SubComponent }) => {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    setExpanded(!expanded);
  };

  // cells
  const cells = columns.map(({ key, accessor, CellComponent, numeric, cellColor }) => {
    const value = accessor ? React.createElement(accessor, data) : data[key];
    const displayValue = value === 0 ? '0' : value;
    const backgroundColor = typeof cellColor === 'function' ? cellColor(data) : cellColor;
    return (
      <StyledTableCell background={backgroundColor} key={key} align={numeric ? 'right' : 'left'}>
        {CellComponent ? <CellComponent value={displayValue} /> : displayValue}
      </StyledTableCell>
    );
  });

  const row = <StyledTableRow onClick={handleClick}>{cells}</StyledTableRow>;

  if (expanded) {
    return (
      <NestedTable row={row}>
        <SubComponent />
      </NestedTable>
    );
  }

  return row;
});

const ErrorSpan = styled.span`
  color: #ff0000;
`;

const ErrorRow = React.memo(({ colSpan, children }) => (
  <StyledTableRow>
    <StyledTableCell colSpan={colSpan} align="center">
      {children}
    </StyledTableCell>
  </StyledTableRow>
));

const getErrorMessage = props => {
  const { isLoading, errorMessage, data, noDataMessage } = props;
  if (isLoading) return 'Loading...';
  if (errorMessage) return errorMessage;
  if (data.length === 0) return noDataMessage;
  return null;
};

/*
 * Body
 */
const Body = props => {
  const { data, columns, errorMessage, rowIdKey, SubComponent } = props;
  const error = getErrorMessage(props);
  if (error) {
    return (
      <ErrorRow colSpan={columns.length}>
        {errorMessage ? <ErrorSpan>{error}</ErrorSpan> : error}
      </ErrorRow>
    );
  }
  return data.map((rowData, index) => {
    // const key = rowData[rowIdKey] || rowData[columns[0].key];
    // eslint-disable-next-line react/no-array-index-key
    return <Row data={rowData} key={index} columns={columns} SubComponent={SubComponent} />;
  });
};

/*
 * Headers
 */
const Headers = props => {
  const { columns, order, orderBy, onChangeOrderBy } = props;
  const getContent = (key, sortable, title) =>
    sortable ? (
      <TableSortLabel
        active={orderBy === key}
        direction={order}
        onClick={() => onChangeOrderBy(key)}
      >
        {title}
      </TableSortLabel>
    ) : (
      title
    );

  return columns.map(({ key, title, numeric, sortable = true }) => (
    <StyledTableCell key={key} align={numeric ? 'right' : 'left'}>
      {getContent(key, sortable, title)}
    </StyledTableCell>
  ));
};

/*
 * Paginator
 */
const Paginator = props => {
  const { columns, page, count, rowsPerPage, rowsPerPageOptions } = props;

  const handleChangePage = (event, newPage) => {
    const { onChangePage } = props;
    if (onChangePage) onChangePage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    const { onChangeRowsPerPage } = props;
    const newRowsPerPage = parseInt(event.target.value, 10);
    if (onChangeRowsPerPage) onChangeRowsPerPage(newRowsPerPage);
  };

  return (
    <TableRow>
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        colSpan={columns.length}
        page={page}
        count={count}
        rowsPerPage={rowsPerPage}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </TableRow>
  );
};

/*
 * Table
 */
export const Table = props => {
  const { page } = props;
  return (
    <StyledTableContainer>
      <StyledTable>
        <StyledTableHead>
          <TableRow>
            <Headers {...props} />
          </TableRow>
        </StyledTableHead>
        <TableBody>
          <Body {...props} />
        </TableBody>
        {page !== null && (
          <StyledTableFooter>
            <Paginator {...props} />
          </StyledTableFooter>
        )}
      </StyledTable>
    </StyledTableContainer>
  );
};

Table.propTypes = {
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
  rowIdKey: PropTypes.string,
};

Table.defaultProps = {
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
  rowsPerPage: DEFAULT_ROWS_PER_PAGE_OPTIONS[0],
  rowsPerPageOptions: DEFAULT_ROWS_PER_PAGE_OPTIONS,
  rowIdKey: '_id', // specific to data expected for tamanu REST api fetches
};
