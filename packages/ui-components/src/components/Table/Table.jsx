import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiTable from '@material-ui/core/Table';
import { TablePaginator, DEFAULT_ROWS_PER_PAGE_OPTIONS } from './TablePaginator';
import { TableHeader } from './TableHeader';
import { TableBody } from './TableBody';
import { TableMessageProvider } from './TableMessageProvider';
import { tableColumnShape } from './tableColumnShape';

const StyledTable = styled(MuiTable)`
  position: relative;
  border-collapse: unset;
  table-layout: fixed;
`;

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
    onRowClick,
    orderBy,
    order,
    page,
    rowsPerPage,
    rowsPerPageOptions,
    rowIdKey,
    isFetching,
    className,
  }) => (
    <StyledTable className={className}>
      {Header && <Header {...{ isFetching, columns, order, orderBy, onChangeOrderBy }} />}
      <TableMessageProvider
        errorMessage={errorMessage}
        isLoading={isLoading}
        hasData={data.length > 0}
        noDataMessage={noDataMessage}
        colSpan={columns.length}
      >
        <Body
          {...{
            data,
            columns,
            errorMessage,
            isLoading,
            isFetching,
            noDataMessage,
            SubComponent,
            rowIdKey,
            onRowClick,
          }}
        />
      </TableMessageProvider>
      {Paginator && (
        <Paginator
          {...{
            columns,
            page,
            isFetching,
            count,
            rowsPerPage,
            rowsPerPageOptions,
            onChangePage,
            onChangeRowsPerPage,
          }}
        />
      )}
    </StyledTable>
  ),
);

Table.propTypes = {
  Header: PropTypes.any,
  Body: PropTypes.any,
  Paginator: PropTypes.any,
  SubComponent: PropTypes.any,
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.array.isRequired,
  errorMessage: PropTypes.string,
  noDataMessage: PropTypes.string,
  isLoading: PropTypes.bool,
  isFetching: PropTypes.bool,
  count: PropTypes.number,
  onChangePage: PropTypes.func,
  onRowClick: PropTypes.func,
  onChangeRowsPerPage: PropTypes.func,
  onChangeOrderBy: PropTypes.func,
  orderBy: PropTypes.string,
  order: PropTypes.string,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
  rowIdKey: PropTypes.string,
  className: PropTypes.string,
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
  isFetching: false,
  onChangePage: null,
  onChangeRowsPerPage: null,
  onChangeOrderBy: null,
  onRowClick: null,
  orderBy: null,
  order: 'asc',
  page: null,
  rowsPerPage: 10,
  rowsPerPageOptions: DEFAULT_ROWS_PER_PAGE_OPTIONS,
  rowIdKey: 'id',
  className: null,
};
