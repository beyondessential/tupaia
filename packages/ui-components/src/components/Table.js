/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiTable from '@material-ui/core/Table';
import MuiTableBody from '@material-ui/core/TableBody';
import MuiTableCell from '@material-ui/core/TableCell';
import MuiTableHead from '@material-ui/core/TableHead';
import MuiTableSortLabel from '@material-ui/core/TableSortLabel';
import MuiTableRow from '@material-ui/core/TableRow';
import MuiTableFooter from '@material-ui/core/TableFooter';
import MuiTablePagination from '@material-ui/core/TablePagination';
import * as COLORS from '../theme/colors';

const TableContext = createContext();

/**************************************************************************************************
 - TableCells
 **************************************************************************************************/
const TableCell = styled(MuiTableCell)`
  padding: 16px;

  &:first-child {
    padding-left: 20px;
  }

  &:last-child {
    padding-left: 20px;
  }
`;

const TableCells = ({ columns, data }) =>
  columns.map(({ key, accessor, CellComponent, numeric, cellColor }) => {
    const value = accessor ? React.createElement(accessor, data) : data[key];
    const displayValue = value === 0 ? '0' : value;
    const backgroundColor = typeof cellColor === 'function' ? cellColor(data) : cellColor;
    return (
      <TableCell background={backgroundColor} key={key} align={numeric ? 'right' : 'left'}>
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
  border: 1px solid #dedee0;
  box-sizing: border-box;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
`;

const NestedTable = ({ row, children }) => (
  <MuiTableRow>
    <StyledTableCell colSpan="4">
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
      <NestedTable row={row}>
        <SubComponent />
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

const getErrorMessage = props => {
  const { isLoading, errorMessage, data, noDataMessage } = props;
  if (isLoading) return 'Loading...';
  if (errorMessage) return errorMessage;
  if (data.length === 0) return noDataMessage;
  return null;
};

/**************************************************************************************************
 - Body
 **************************************************************************************************/
export const TableBody = () => {
  const props = useContext(TableContext);
  const { data, columns, errorMessage, SubComponent } = props;
  const error = getErrorMessage(props);
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

export const NestedTableBody = () => {
  const props = useContext(TableContext);
  const { data, columns, errorMessage } = props;
  const error = getErrorMessage(props);
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
export const TableHeaders = () => {
  const props = useContext(TableContext);
  const { columns, order, orderBy, onChangeOrderBy } = props;
  const getContent = (key, sortable, title) =>
    sortable ? (
      <MuiTableSortLabel
        active={orderBy === key}
        direction={order}
        onClick={() => onChangeOrderBy(key)}
      >
        {title}
      </MuiTableSortLabel>
    ) : (
      title
    );

  return (
    <MuiTableHead>
      <MuiTableRow>
        {columns.map(({ key, title, numeric, sortable = true }) => (
          <TableCell key={key} align={numeric ? 'right' : 'left'}>
            {getContent(key, sortable, title)}
          </TableCell>
        ))}
      </MuiTableRow>
    </MuiTableHead>
  );
};

const GreyBox = styled(TableCell)`
  background: #dddddd;
  width: 100%;
  height: 30px;
  margin: 0;
  padding: 0;
`;

export const CustomHeader = () => {
  return (
    <MuiTableHead>
      <MuiTableRow>
        <GreyBox colSpan={4} />
      </MuiTableRow>
    </MuiTableHead>
  );
};

/**************************************************************************************************
 - Paginator
 **************************************************************************************************/
export const TablePaginator = () => {
  const props = useContext(TableContext);
  const { columns, page, count, rowsPerPage, rowsPerPageOptions } = props;

  if (!page) {
    return null;
  }

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
`;

export const Table = ({ children, ...props }) => {
  return (
    <StyledTable>
      <TableContext.Provider value={props}>{children}</TableContext.Provider>
    </StyledTable>
  );
};

export const FullTable = props => {
  return (
    <TableContainer>
      <StyledTable>
        <TableContext.Provider value={props}>
          <TableHeaders />
          <TableBody />
          <TablePaginator />
        </TableContext.Provider>
      </StyledTable>
    </TableContainer>
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
  rowsPerPage: 10,
  rowsPerPageOptions: [10, 25, 50],
};
