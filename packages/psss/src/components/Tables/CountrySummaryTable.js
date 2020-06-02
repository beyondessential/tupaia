/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import styled from 'styled-components';
import React from 'react';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { CondensedTableBody, FakeHeader } from '@tupaia/ui-components';
import { ConnectedTable } from './ConnectedTable';
import * as COLORS from '../../theme/colors';
import { FIRST_COLUMN_WIDTH, SITES_REPORTED_COLUMN_WIDTH } from './constants';
import { AlertCell, SitesReportedCell } from './TableCellComponents';

const CountrySummaryTitle = styled.div`
  color: ${COLORS.TEXT_DARKGREY};
  font-weight: 400;
  font-size: 0.9375rem;
`;

const NameCell = ({ week, startDate, endDate }) => {
  const start = `${format(startDate, 'LLL d')}`;
  const end = `${format(endDate, 'LLL d')}`;
  const year = `${format(endDate, 'yyyy')}`;
  return (
    <CountrySummaryTitle>
      <strong>W{week}</strong> {`${start} - ${end}, ${year}`}
    </CountrySummaryTitle>
  );
};

NameCell.propTypes = {
  week: PropTypes.number.isRequired,
  startDate: PropTypes.instanceOf(Date).isRequired,
  endDate: PropTypes.instanceOf(Date).isRequired,
};

const dataAccessor = key => data => {
  const indicator = data.indicators.find(i => i.id === key);
  return indicator ? indicator.totalCases : null;
};

const countrySummaryTableColumns = [
  {
    title: 'Name',
    key: 'name',
    width: FIRST_COLUMN_WIDTH,
    align: 'left',
    CellComponent: NameCell,
  },
  {
    title: 'Site Reported',
    key: 'sitesReported',
    CellComponent: SitesReportedCell,
    width: SITES_REPORTED_COLUMN_WIDTH,
  },
  {
    title: 'AFR',
    key: 'AFR',
    accessor: dataAccessor('afr'),
    CellComponent: AlertCell,
  },
  {
    title: 'DIA',
    key: 'DIA',
    accessor: dataAccessor('dia'),
    CellComponent: AlertCell,
  },
  {
    title: 'ILI',
    key: 'ILI',
    accessor: dataAccessor('ili'),
    CellComponent: AlertCell,
  },
  {
    title: 'PF',
    key: 'PF',
    accessor: dataAccessor('pf'),
    CellComponent: AlertCell,
  },
  {
    title: 'DIL',
    key: 'DIL',
    accessor: dataAccessor('dil'),
    CellComponent: AlertCell,
  },
];

const TableHeader = () => {
  return <FakeHeader>PREVIOUS 8 WEEKS</FakeHeader>;
};

export const CountrySummaryTable = React.memo(props => (
  <React.Fragment>
    <TableHeader />
    <ConnectedTable
      endpoint="country-weeks"
      fetchOptions={{ filterId: props }}
      columns={countrySummaryTableColumns}
      Header={false}
      Body={CondensedTableBody}
    />
  </React.Fragment>
));
