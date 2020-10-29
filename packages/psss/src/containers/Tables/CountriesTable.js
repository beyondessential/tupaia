/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Table, ExpandableTableBody } from '@tupaia/ui-components';
import { useQuery } from 'react-query';
// import { Table } from '@tupaia/ui-components';
import { COLUMN_WIDTHS } from './constants';
import { CountrySummaryTable } from './CountrySummaryTable';
import {
  createTotalCasesAccessor,
  AlertCell,
  SitesReportedCell,
  CountryNameLinkCell,
} from '../../components';
import { FakeAPI as api } from '../../api';
// import { ConnectedTable } from './ConnectedTable';

const countriesTableColumns = [
  {
    title: 'Country',
    key: 'name',
    width: COLUMN_WIDTHS.FIRST,
    align: 'left',
    CellComponent: CountryNameLinkCell,
  },
  {
    title: 'Site Reported',
    key: 'sitesReported',
    CellComponent: SitesReportedCell,
    width: COLUMN_WIDTHS.SITES_REPORTED,
  },
  {
    title: 'AFR',
    key: 'AFR',
    accessor: createTotalCasesAccessor('afr'),
    CellComponent: AlertCell,
  },
  {
    title: 'DIA',
    key: 'DIA',
    accessor: createTotalCasesAccessor('dia'),
    CellComponent: AlertCell,
  },
  {
    title: 'ILI',
    key: 'ILI',
    accessor: createTotalCasesAccessor('ili'),
    CellComponent: AlertCell,
  },
  {
    title: 'PF',
    key: 'PF',
    accessor: createTotalCasesAccessor('pf'),
    CellComponent: AlertCell,
  },
  {
    title: 'DIL',
    key: 'DIL',
    accessor: createTotalCasesAccessor('dil'),
    CellComponent: AlertCell,
  },
];

const useTableQuery = (endpoint, options) => {
  const [sorting, setSorting] = React.useState({ order: 'asc', orderBy: undefined });
  const query = useQuery(
    [endpoint, options, sorting],
    () => api.get(endpoint, { ...options, ...sorting }),
    { staleTime: 50 },
  );

  const handleChangeOrderBy = columnKey => {
    const { order, orderBy } = sorting;
    const isDesc = orderBy === columnKey && order === 'desc';
    const newSorting = { order: isDesc ? 'asc' : 'desc', orderBy: columnKey };
    setSorting(newSorting);
  };

  return { ...query, ...sorting, handleChangeOrderBy };
};

export const CountriesTable = () => {
  const { isLoading, isFetching, error, data, order, orderBy, handleChangeOrderBy } = useTableQuery(
    'countries',
    {
      countries: ['TO', 'WS'],
    },
  );

  return (
    <>
      <Table
        order={order}
        orderBy={orderBy}
        onChangeOrderBy={handleChangeOrderBy}
        data={data ? data.data : 0}
        count={data ? data.count : 0}
        isLoading={isLoading}
        errorMessage={error && error.message}
        columns={countriesTableColumns}
        Body={ExpandableTableBody}
        SubComponent={CountrySummaryTable}
      />
      {isFetching && 'Fetching...'}
    </>
  );
};

// export const CountriesTable = React.memo(() => (
//   <ConnectedTable
//     endpoint="countries"
//     fetchOptions={{ countries: ['TO', 'WS'] }}
//     columns={countriesTableColumns}
//     Body={ExpandableTableBody}
//     SubComponent={CountrySummaryTable}
//   />
// ));
