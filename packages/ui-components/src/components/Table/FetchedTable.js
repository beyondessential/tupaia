/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getSortByKey } from '@tupaia/utils';
import { Table } from './Table';
import { TablePaginator } from './TablePaginator';
import { TableHeader } from './TableHeader';
import { TableBody } from './TableBody';
import { tableColumnShape } from './tableColumnShape';

const toggleOrder = order => (order === 'desc' ? 'asc' : 'desc');

export const FetchedTable = React.memo(
  ({
    Header,
    Body,
    Paginator,
    SubComponent,
    columns,
    data: initialData,
    errorMessage,
    noDataMessage,
    isLoading,
    count,
    onChangePage,
    onChangeRowsPerPage,
    onRowClick,
    orderBy: initialOrderBy,
    order: initialOrder,
    page,
    rowsPerPage,
    rowIdKey,
    isFetching,
    className,
  }) => {
    const [orderBy, setOrderBy] = useState(initialOrderBy);
    const [order, setOrder] = useState(initialOrder);
    const [data, setData] = useState(initialData);

    useEffect(() => {
      const ascending = order !== 'desc';
      const newData = [...initialData].sort(getSortByKey(orderBy, { ascending }));
      setData(newData);
    }, [initialData, orderBy, order]);

    const handleChangeOrderBy = useCallback(
      columnKey => {
        const newOrder = columnKey === orderBy ? toggleOrder(order) : 'asc';
        setOrderBy(columnKey);
        setOrder(newOrder);
      },
      [order, orderBy],
    );

    return (
      <Table
        Header={Header}
        Body={Body}
        Paginator={Paginator}
        SubComponent={SubComponent}
        columns={columns}
        data={data}
        errorMessage={errorMessage}
        noDataMessage={noDataMessage}
        isLoading={isLoading}
        count={count}
        onChangePage={onChangePage}
        onChangeRowsPerPage={onChangeRowsPerPage}
        onChangeOrderBy={handleChangeOrderBy}
        onRowClick={onRowClick}
        orderBy={orderBy}
        order={order}
        page={page}
        rowsPerPage={rowsPerPage}
        rowIdKey={rowIdKey}
        isFetching={isFetching}
        className={className}
      />
    );
  },
);

FetchedTable.propTypes = {
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
  orderBy: PropTypes.string,
  order: PropTypes.string,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  rowIdKey: PropTypes.string,
  className: PropTypes.string,
};

FetchedTable.defaultProps = {
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
  orderBy: null,
  order: 'asc',
  onRowClick: null,
  page: null,
  rowsPerPage: 10,
  rowIdKey: 'id',
  className: null,
};
