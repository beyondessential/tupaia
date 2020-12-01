/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Table, CondensedTableBody, FakeHeader } from '@tupaia/ui-components';
import { COLUMN_WIDTHS } from './constants';
import {
  createTotalCasesAccessor,
  AlertCell,
  SitesReportedCell,
  WeekAndDateCell,
} from '../../components';
import { useTableQuery } from '../../api';

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
    title: 'DLI',
    key: 'DLI',
    accessor: createTotalCasesAccessor('dli'),
    CellComponent: AlertCell,
  },
];

export const CountrySummaryTable = React.memo(({ rowData }) => {
  const {
    isLoading,
    error,
    data,
    order,
    orderBy,
    handleChangeOrderBy,
  } = useTableQuery('country-weeks', { countryCode: rowData.countryCode });

  return (
    <>
      <FakeHeader>PREVIOUS 8 WEEKS</FakeHeader>
      <Table
        columns={countrySummaryTableColumns}
        Header={false}
        Body={CondensedTableBody}
        order={order}
        orderBy={orderBy}
        onChangeOrderBy={handleChangeOrderBy}
        data={data ? data.data : 0}
        count={data ? data.count : 0}
        isLoading={isLoading}
        errorMessage={error && error.message}
      />
    </>
  );
});

CountrySummaryTable.propTypes = {
  rowData: PropTypes.shape({
    countryCode: PropTypes.string.isRequired,
  }).isRequired,
};
