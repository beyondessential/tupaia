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

/*
 * Table Cell styles
 */
const TableCell = styled(MuiTableCell)`
  padding: 1rem;
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

/*
 * TableCells Component
 */
const TableCells = React.memo(({ columns, rowData }) =>
  columns.map(({ key, accessor, CellComponent, width = null, align = 'center', cellColor }) => {
    const value = accessor ? React.createElement(accessor, rowData) : rowData[key];
    const displayValue = value === 0 ? '0' : value;
    const backgroundColor = typeof cellColor === 'function' ? cellColor(rowData) : cellColor;
    return (
      <TableCell background={backgroundColor} key={key} style={{ width: width }} align={align}>
        {CellComponent ? <CellComponent value={displayValue} /> : displayValue}
      </TableCell>
    );
  }),
);

/*
 * Shape of columns propType
 */
const columnShape = {
  key: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  accessor: PropTypes.func,
  sortable: PropTypes.bool,
};

TableCells.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(columnShape)).isRequired,
  rowData: PropTypes.object.isRequired,
};

const NestedTableWrapperCell = styled.td`
  background: white;
  padding: 0;
  border: 1px solid ${COLORS.GREY_DE};
  box-sizing: border-box;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
`;

/*
 * NestedTable Component
 */
const NestedTable = React.memo(({ row, children, columns }) => (
  <MuiTableRow>
    <NestedTableWrapperCell colSpan={columns.length}>
      <StyledTable>
        <tbody>{row}</tbody>
      </StyledTable>
      {children}
    </NestedTableWrapperCell>
  </MuiTableRow>
));

NestedTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(columnShape)).isRequired,
  row: PropTypes.any.isRequired,
  children: PropTypes.any,
};

NestedTable.defaultProps = {
  children: PropTypes.null,
};

/*
 * Row styles
 */
const rowBackgroundColor = '#F1F1F1';
const rowHoverColor = 'rgba(255, 255, 255, 0.6)';

const StyledTableRow = styled(MuiTableRow)`
  cursor: pointer;
  border-bottom: 1px solid ${COLORS.GREY_DE};

  &:nth-of-type(even) {
    background: ${rowBackgroundColor};
  }

  &:hover {
    background: ${rowHoverColor};
  }
`;

const condensedRowBackgroundColor = '#EFEFEF';

const CondensedStyleTableRow = styled(MuiTableRow)`
  &:nth-of-type(even) {
    background: ${condensedRowBackgroundColor};
  }

  .MuiTableCell-root {
    border: none;
  }
`;

/*
 * TableRow Component
 */
const TableRow = React.memo(({ columns, rowData, variant }) => {
  const RowType = variant === 'condensed' ? CondensedStyleTableRow : StyledTableRow;
  return (
    <RowType>
      <TableCells columns={columns} rowData={rowData} />
    </RowType>
  );
});

TableRow.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(columnShape)).isRequired,
  rowData: PropTypes.object.isRequired,
  variant: PropTypes.string,
};

TableRow.defaultProps = {
  variant: 'standard',
};

/*
 * ExpandableTableRow Component
 */
const ExpandableTableRow = React.memo(({ columns, rowData, SubComponent }) => {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    setExpanded(!expanded);
  };

  const row = (
    <StyledTableRow onClick={handleClick}>
      <TableCells columns={columns} rowData={rowData} />
    </StyledTableRow>
  );

  if (SubComponent && expanded) {
    return (
      <NestedTable row={row} columns={columns}>
        <SubComponent rowData={rowData} />
      </NestedTable>
    );
  }

  return row;
});

ExpandableTableRow.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(columnShape)).isRequired,
  rowData: PropTypes.object.isRequired,
  SubComponent: PropTypes.func,
};

ExpandableTableRow.defaultProps = {
  SubComponent: PropTypes.null,
};

/*
 * ErrorSpan Styles
 */
const ErrorSpan = styled.span`
  color: ${COLORS.RED};
`;

/*
 * ErrorRow Component
 */
const TableMessage = React.memo(({ colSpan, errorMessage, message }) => (
  <MuiTableBody>
    <StyledTableRow>
      <TableCell colSpan={colSpan} align="center">
        {errorMessage ? <ErrorSpan>{errorMessage}</ErrorSpan> : message}
      </TableCell>
    </StyledTableRow>
  </MuiTableBody>
));

TableMessage.propTypes = {
  colSpan: PropTypes.number.isRequired,
  message: PropTypes.string.isRequired,
  errorMessage: PropTypes.string,
};

TableMessage.defaultProps = {
  errorMessage: '',
};

/*
 * TableBody Component
 */
export const TableBody = React.memo(({ data, columns, SubComponent }) => (
  <MuiTableBody>
    {data.map((rowData, index) => {
      return (
        <ExpandableTableRow
          rowData={rowData}
          key={index}
          columns={columns}
          SubComponent={SubComponent}
        />
      );
    })}
  </MuiTableBody>
));

TableBody.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(columnShape)).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  SubComponent: PropTypes.func,
};

TableBody.defaultProps = {
  SubComponent: null,
};

/*
 * NestedTableRow Component
 */
export const NestedTableBody = React.memo(({ data, columns }) => (
  <MuiTableBody>
    {data.map((rowData, index) => {
      return (
        // eslint-disable-next-line react/no-array-index-key
        <TableRow rowData={rowData} key={index} columns={columns} variant="condensed" />
      );
    })}
  </MuiTableBody>
));

NestedTableBody.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(columnShape)).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

/*
 * TableHeader Styles
 */
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

/*
 * TableHeader Component
 */
export const TableHeader = React.memo(({ columns, order, orderBy, onChangeOrderBy }) => {
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
});

TableHeader.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(columnShape)).isRequired,
  onChangeOrderBy: PropTypes.func,
  orderBy: PropTypes.string,
  order: PropTypes.string,
};

TableHeader.defaultProps = {
  onChangeOrderBy: null,
  orderBy: null,
  order: 'asc',
};

/*
 * TablePaginator Component
 */
export const TablePaginator = React.memo(
  ({
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
  },
);

TablePaginator.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(columnShape)).isRequired,
  count: PropTypes.number,
  onChangePage: PropTypes.func,
  onChangeRowsPerPage: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
};

TablePaginator.defaultProps = {
  count: 0,
  onChangePage: null,
  onChangeRowsPerPage: null,
  page: null,
  rowsPerPage: 10,
  rowsPerPageOptions: [10, 25, 50],
};

/*
 * TableMessageProvider
 * Checks if there is a status message for the table and if so returns it instead of the table body
 */
const getMessage = ({ isLoading, errorMessage, isData, noDataMessage }) => {
  if (isLoading) return 'Loading...';
  if (errorMessage) return errorMessage;
  if (isData === 0) return noDataMessage;
  return null;
};

const TableMessageProvider = React.memo(
  ({ isLoading, errorMessage, isData, noDataMessage, colSpan, children }) => {
    const message = getMessage({ errorMessage, isLoading, isData, noDataMessage });
    if (message) {
      return (
        <MuiTableBody>
          <StyledTableRow>
            <TableCell colSpan={colSpan} align="center">
              {errorMessage ? <ErrorSpan>{errorMessage}</ErrorSpan> : message}
            </TableCell>
          </StyledTableRow>
        </MuiTableBody>
      );
    }

    return children;
  },
);

TableMessageProvider.propTypes = {
  isData: PropTypes.bool.isRequired,
  colSpan: PropTypes.number.isRequired,
  children: PropTypes.any.isRequired,
  noDataMessage: PropTypes.string,
  isLoading: PropTypes.bool,
  errorMessage: PropTypes.string,
};

TableMessageProvider.defaultProps = {
  errorMessage: '',
  noDataMessage: 'No data found',
  isLoading: false,
};

/*
 * Table Component Styles
 */
export const StyledTable = styled(MuiTable)`
  border-collapse: unset;
  table-layout: fixed;
`;

/*
 * Table Component
 */
export const Table = React.memo(
  ({
    Header,
    Body,
    Paginator,
    SubComponent,
    columns,
    data,
    errorMessage,
    noDataMessage,
    isLoading,
    count,
    onChangePage,
    onChangeRowsPerPage,
    onChangeOrderBy,
    orderBy,
    order,
    page,
    rowsPerPage,
    rowsPerPageOptions,
  }) => (
    <StyledTable>
      {Header && <Header {...{ columns, order, orderBy, onChangeOrderBy }} />}
      <TableMessageProvider
        errorMessage={errorMessage}
        isLoading={isLoading}
        isData={data.length > 0}
        noDataMessage={noDataMessage}
        colSpan={columns.length}
      >
        <Body
          {...{
            data,
            columns,
            errorMessage,
            isLoading,
            noDataMessage,
            SubComponent,
          }}
        />
      </TableMessageProvider>
      <Paginator
        {...{
          columns,
          page,
          count,
          rowsPerPage,
          rowsPerPageOptions,
          onChangePage,
          onChangeRowsPerPage,
        }}
      />
    </StyledTable>
  ),
);

Table.propTypes = {
  Header: PropTypes.any,
  Body: PropTypes.any,
  Paginator: PropTypes.any,
  SubComponent: PropTypes.any,
  columns: PropTypes.arrayOf(PropTypes.shape(columnShape)).isRequired,
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
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
};

Table.defaultProps = {
  Header: TableHeader,
  Body: TableBody,
  Paginator: TablePaginator,
  SubComponent: null,
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
  rowsPerPage: 10,
  rowsPerPageOptions: [10, 25, 50],
};
