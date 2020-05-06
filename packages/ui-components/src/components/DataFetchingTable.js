/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useCallback, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { Table } from './Table';
import { connectApi } from '../api';

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

/*
 * DumbDataFetchingTable Component
 * Export so that mappings to alternative apis can be defined
 */
export const DumbDataFetchingTable = memo(
  ({
    Header,
    Body,
    Paginator,
    columns,
    SubComponent,
    fetchData,
    noDataMessage,
    fetchOptions,
    transformRow,
    initialSort,
  }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0]);
    const [sorting, setSorting] = useState(initialSort);
    const defaultFetchState = { data: [], count: 0, errorMessage: '', isLoading: true };
    const [fetchState, setFetchState] = useState(defaultFetchState);

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
      let updateFetchState = newFetchState => setFetchState({ ...fetchState, ...newFetchState });

      updateFetchState({ isLoading: true });
      (async () => {
        try {
          const { data, count } = await fetchData({ page, rowsPerPage, ...sorting });
          const transformedData = transformRow ? data.map(transformRow) : data;
          updateFetchState({
            ...defaultFetchState,
            data: transformedData,
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
        order={order}
        orderBy={orderBy}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        noDataMessage={noDataMessage}
        SubComponent={SubComponent}
      />
    );
  },
);

DumbDataFetchingTable.propTypes = {
  Header: PropTypes.any,
  Body: PropTypes.any,
  Paginator: PropTypes.any,
  SubComponent: PropTypes.any,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.node.isRequired,
      accessor: PropTypes.func,
      sortable: PropTypes.bool,
    }),
  ).isRequired,
  fetchData: PropTypes.func.isRequired,
  noDataMessage: PropTypes.string,
  fetchOptions: PropTypes.object,
  transformRow: PropTypes.func,
  initialSort: PropTypes.shape({
    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string,
  }),
};

DumbDataFetchingTable.defaultProps = {
  Header: undefined, // these values need to default to undefined so they don't override the Table defaults
  Body: undefined,
  Paginator: undefined,
  SubComponent: undefined,
  noDataMessage: undefined,
  fetchOptions: undefined,
  transformRow: undefined,
  initialSort: { order: 'asc', orderBy: undefined },
};

function mapApiToProps(api, { endpoint, fetchOptions }) {
  return {
    fetchData: queryParameters => api.get(endpoint, { ...fetchOptions, ...queryParameters }),
  };
}

export const DataFetchingTable = connectApi(mapApiToProps)(DumbDataFetchingTable);
