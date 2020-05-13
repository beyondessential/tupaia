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
import { AFRCell, SitesReportedCell } from './TableCellComponents';

const CountrySummaryTitle = styled.div`
  color: ${COLORS.TEXT_DARKGREY};
  font-weight: 400;
  font-size: 0.9375rem;
`;

export const NameCell = ({ week, startDate, endDate }) => {
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

const countrySummaryTableColumns = [
  {
    title: 'Name',
    key: 'name',
    width: '30%',
    align: 'left',
    CellComponent: NameCell,
  },
  {
    title: 'Site Reported',
    key: 'sitesReported',
    CellComponent: SitesReportedCell,
    width: '100px',
  },
  {
    title: 'AFR',
    key: 'AFR',
    CellComponent: AFRCell,
  },
  {
    title: 'DIA',
    key: 'DIA',
  },
  {
    title: 'ILI',
    key: 'ILI',
  },
  {
    title: 'PF',
    key: 'PF',
  },
  {
    title: 'DLI',
    key: 'DLI',
  },
];

const TableHeader = () => {
  return <FakeHeader>PREVIOUS 8 WEEKS</FakeHeader>;
};

export const CountrySummaryTable = props => (
  <React.Fragment>
    <TableHeader />
    <ConnectedTable
      endpoint="country-weeks"
      fetchOptions={{ filterId: props.rowData.id }}
      columns={countrySummaryTableColumns}
      Header={false}
      Body={CondensedTableBody}
    />
  </React.Fragment>
);
