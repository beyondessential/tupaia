/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useCallback, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { Table } from './Table';

const DEFAULT_ROWS_PER_PAGE = 10;
const DEFAULT_FETCH_STATE = { data: [], count: 0, errorMessage: '', isLoading: true };

export const DataFetchingTable = memo(
  ({
    Header,
    Body,
    Paginator,
    columns,
    SubComponent,
    fetchData,
    noDataMessage,
    fetchOptions,
    initialSort,
    onRowClick,
  }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
    const [sorting, setSorting] = useState(initialSort);
    const [fetchState, setFetchState] = useState(DEFAULT_FETCH_STATE);

    const handleChangeOrderBy = useCallback(
      columnKey => {
        const { order, orderBy } = sorting;
        const isDesc = orderBy === columnKey && order === 'desc';
        const newSorting = { order: isDesc ? 'asc' : 'desc', orderBy: columnKey };
        setSorting(newSorting);
      },
      [sorting],
    );

    useEffect(() => {
      let updateFetchState = newFetchState =>
        setFetchState(prevFetchState => ({ ...prevFetchState, ...newFetchState }));

      updateFetchState({ isLoading: true });
      (async () => {
        try {
          const { data, count } = await fetchData({ page, rowsPerPage, ...sorting });
          updateFetchState({
            ...DEFAULT_FETCH_STATE,
            data: data,
            count,
            isLoading: false,
          });
        } catch (error) {
          updateFetchState({ errorMessage: error.message, isLoading: false });
        }
      })();

      return () => {
        updateFetchState = () => {}; // discard the fetch state update if this request is stale
      };
    }, [page, rowsPerPage, sorting, fetchOptions]);

    const { data, count, isLoading, errorMessage } = fetchState;
    const { order, orderBy } = sorting;

    return (
      <Table
        Header={Header}
        Body={Body}
        Paginator={Paginator}
        isLoading={isLoading}
        columns={columns}
        data={data}
        errorMessage={errorMessage}
        rowsPerPage={rowsPerPage}
        page={page}
        count={count}
        onChangePage={setPage}
        onChangeRowsPerPage={setRowsPerPage}
        onChangeOrderBy={handleChangeOrderBy}
        onRowClick={onRowClick}
        order={order}
        orderBy={orderBy}
        noDataMessage={noDataMessage}
        SubComponent={SubComponent}
      />
    );
  },
);

DataFetchingTable.propTypes = {
  Header: PropTypes.any,
  Body: PropTypes.any,
  Paginator: PropTypes.any,
  SubComponent: PropTypes.any,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.node.isRequired,
      accessor: PropTypes.func,
      CellComponent: PropTypes.any,
      sortable: PropTypes.bool,
    }),
  ).isRequired,
  fetchData: PropTypes.func.isRequired,
  noDataMessage: PropTypes.string,
  onRowClick: PropTypes.func,
  fetchOptions: PropTypes.object,
  initialSort: PropTypes.shape({
    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string,
  }),
};

DataFetchingTable.defaultProps = {
  Header: undefined, // these values need to default to undefined so they don't override the Table defaults
  Body: undefined,
  Paginator: undefined,
  onRowClick: undefined,
  SubComponent: undefined,
  noDataMessage: undefined,
  fetchOptions: undefined,
  initialSort: { order: 'asc', orderBy: undefined },
};
