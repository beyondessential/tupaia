/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import styled from 'styled-components';
import React from 'react';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import {
  SitesReportedAccessor,
  AFRAccessor,
  CondensedTableBody,
  FakeHeader,
} from '@tupaia/ui-components';
import { ConnectedTable } from './ConnectedTable';
import * as COLORS from '../../theme/colors';

const CountrySummaryTitle = styled.div`
  color: ${COLORS.TEXT_DARKGREY};
  font-weight: 400;
  font-size: 0.9375rem;
`;

export const NameAccessor = ({ week, startDate, endDate }) => {
  const start = `${format(startDate, 'LLL d')}`;
  const end = `${format(endDate, 'LLL d')}`;
  const year = `${format(endDate, 'yyyy')}`;
  return (
    <CountrySummaryTitle>
      <strong>W{week}</strong> {`${start} - ${end}, ${year}`}
    </CountrySummaryTitle>
  );
};

NameAccessor.propTypes = {
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
    accessor: NameAccessor,
  },
  {
    title: 'Site Reported',
    key: 'sitesReported',
    accessor: SitesReportedAccessor,
    width: '100px',
  },
  {
    title: 'AFR',
    key: 'AFR',
    accessor: AFRAccessor,
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
