/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiTable from '@material-ui/core/Table';
import { TablePaginator } from './TablePaginator';
import { TableHeader } from './TableHeader';
import { TableBody } from './TableBody';
import { TableMessageProvider } from './TableMessageProvider';
import { tableColumnShape } from './tableColumnShape';

const StyledTable = styled(MuiTable)`
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
    orderBy,
    order,
    page,
    rowsPerPage,
    rowIdKey,
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
            rowIdKey,
          }}
        />
      </TableMessageProvider>
      {Paginator && (
        <Paginator
          {...{
            columns,
            page,
            count,
            rowsPerPage,
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
  rowIdKey: PropTypes.string,
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
  rowIdKey: 'id',
};
