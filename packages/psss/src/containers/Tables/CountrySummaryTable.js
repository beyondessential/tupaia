/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Table, CondensedTableBody, FakeHeader } from '@tupaia/ui-components';
import { COLUMN_WIDTHS } from './constants';
import { AlertCell, SitesReportedCell, WeekAndDateCell } from '../../components';
import { useLiveTableQuery, useTableQuery } from '../../api';

const countrySummaryTableColumns = [
  {
    title: 'Name',
    key: 'name',
    width: '30%', // must be same as CountriesTable name column to align
    align: 'left',
    CellComponent: WeekAndDateCell,
  },
  {
    title: 'Sites Reported',
    key: 'sitesReported',
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

export const CountrySummaryTable = React.memo(({ rowData }) => {
  const { isLoading, error, data } = useLiveTableQuery(
    `confirmedWeeklyReport/${rowData.organisationUnit}`,
    {
      params: { startWeek: '2020W14', endWeek: '2020W22' },
    },
  );

  return (
    <>
      <FakeHeader>PREVIOUS 8 WEEKS</FakeHeader>
      <Table
        columns={countrySummaryTableColumns}
        Header={false}
        Body={CondensedTableBody}
        data={!isLoading ? data?.data?.results : []}
        isLoading={isLoading}
        errorMessage={error && error.message}
        rowIdKey="period"
      />
    </>
  );
});

CountrySummaryTable.propTypes = {
  rowData: PropTypes.shape({
    organisationUnit: PropTypes.string.isRequired,
  }).isRequired,
};
