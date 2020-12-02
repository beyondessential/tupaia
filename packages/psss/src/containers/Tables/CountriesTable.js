/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { ExpandableTable, ExpandableTableBody } from '@tupaia/ui-components';
import { COLUMN_WIDTHS } from './constants';
import { CountrySummaryTable } from './CountrySummaryTable';
import { useLiveTableQuery } from '../../api';
import { AlertCell, SitesReportedCell, CountryNameLinkCell } from '../../components';

const countriesTableColumns = [
  {
    title: 'Country',
    key: 'organisationUnit',
    width: '30%', // must be same as CountrySummaryTable name column to align
    align: 'left',
    CellComponent: CountryNameLinkCell,
  },
  {
    title: 'Sites Reported',
    key: 'Sites Reported',
    CellComponent: SitesReportedCell,
    width: COLUMN_WIDTHS.SITES_REPORTED,
  },
  {
    title: 'AFR',
    key: 'AFR',
    CellComponent: AlertCell,
  },
  {
    title: 'DIA',
    key: 'DIA',
    CellComponent: AlertCell,
  },
  {
    title: 'ILI',
    key: 'ILI',
    CellComponent: AlertCell,
  },
  {
    title: 'PF',
    key: 'PF',
    CellComponent: AlertCell,
  },
  {
    title: 'DLI',
    key: 'DLI',
    CellComponent: AlertCell,
  },
];

export const CountriesTable = () => {
  const { data, isLoading, error, isFetching } = useLiveTableQuery('confirmedWeeklyReport', {
    params: { startWeek: '2020W13' },
  });

  return (
    <>
      <ExpandableTable
        data={!isLoading ? data?.data?.results : []}
        isLoading={isLoading}
        errorMessage={error && error.message}
        columns={countriesTableColumns}
        Body={ExpandableTableBody}
        rowIdKey="organisationUnit"
        SubComponent={CountrySummaryTable}
      />
      {isFetching && '...'}
    </>
  );
};
