/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
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
import { Alarm } from '@material-ui/icons';
import Typography from '@material-ui/core/Typography';
import { Button } from './Button';

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
  margin-top: 1rem;

  ${p =>
    p.onClick
      ? `
      cursor: pointer;
      &:hover {
        background: rgba(255,255,255,0.6);
      }
    `
      : ''}
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

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem;
`;

const StyledSpan = styled.span`
  display: flex;
  align-items: center;
`;

const StyledNestedTable = styled(MaterialTable)`
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);

  border: 1px solid ${Colors.outline};
  border-radius: 3px 3px 0 0;
  border-collapse: unset;
  background: ${Colors.white};

  &:last-child {
    border-bottom: none;
  }
`;

const NestedTable = ({ data, columns }) => {
  console.log('Nested Table', data);
  const handleClick = () => {
    console.log('click');
  };

  const customAction = () => {
    console.log('custom action');
  };

  return (
    <TableRow>
      <TableCell colSpan="4">
        <StyledNestedTable>
          <TableBody>
            {data.map((rowData, index) => {
              // eslint-disable-next-line react/no-array-index-key
              return <Row data={rowData} key={index} onClick={handleClick} columns={columns} />;
            })}
            <TableRow>
              <TableCell colSpan="4">
                <StyledDiv>
                  <StyledSpan>
                    <Alarm />
                    <Typography variant="body1">
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                    </Typography>
                  </StyledSpan>
                  <Button onClick={customAction}>Save and Submit</Button>
                </StyledDiv>
              </TableCell>
            </TableRow>
          </TableBody>
        </StyledNestedTable>
      </TableCell>
    </TableRow>
  );
};

/*
 * Row
 */
const Row = React.memo(({ columns, data, onClick }) => {
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

  return (
    <React.Fragment>
      <StyledTableRow onClick={onClick && (() => onClick(data))}>{cells}</StyledTableRow>
      {data.nested && <NestedTable data={data.nested} columns={columns} />}
    </React.Fragment>
  );
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
  const { data, columns, onRowClick, errorMessage, rowIdKey } = props;
  const error = getErrorMessage(props);
  if (error) {
    return (
      <ErrorRow colSpan={columns.length}>
        {errorMessage ? <ErrorSpan>{error}</ErrorSpan> : error}
      </ErrorRow>
    );
  }
  return data.map(rowData => {
    const key = rowData[rowIdKey] || rowData[columns[0].key];
    return <Row data={rowData} key={key} columns={columns} onClick={onRowClick} />;
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
