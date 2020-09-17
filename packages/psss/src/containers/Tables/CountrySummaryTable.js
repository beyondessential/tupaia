/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { CondensedTableBody, FakeHeader } from '@tupaia/ui-components';
import { COLUMN_WIDTHS } from './constants';
import {
  ConnectedTable,
  createTotalCasesAccessor,
  AlertCell,
  SitesReportedCell,
  WeekAndDateCell,
} from '../../components';

const countrySummaryTableColumns = [
  {
    title: 'Name',
    key: 'name',
    width: COLUMN_WIDTHS.FIRST,
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
    title: 'DIL',
    key: 'DIL',
    accessor: createTotalCasesAccessor('dil'),
    CellComponent: AlertCell,
  },
];

const TableHeader = () => {
  return <FakeHeader>PREVIOUS 8 WEEKS</FakeHeader>;
};

export const CountrySummaryTable = React.memo(() => (
  <>
    <TableHeader />
    <ConnectedTable
      endpoint="country-weeks"
      columns={countrySummaryTableColumns}
      Header={false}
      Body={CondensedTableBody}
    />
  </>
));
