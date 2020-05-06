/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import styled from 'styled-components';
import React from 'react';
import MuiLink from '@material-ui/core/Link';
import Avatar from '@material-ui/core/Avatar';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { DataFetchingTable, SitesReportedAccessor, AFRAccessor } from '@tupaia/ui-components';
import * as COLORS from '../../theme/colors';
import { CountrySummaryTable } from './CountrySummaryTable';

const CountryTitle = styled(MuiLink)`
  display: flex;
  align-items: center;
  font-weight: 400;
  font-size: 1.125rem;
  color: ${COLORS.BLUE};

  .MuiAvatar-root {
    margin-right: 0.6rem;
    color: ${COLORS.GREY_DE};
    background-color: ${COLORS.GREY_DE};
  }
`;

export const NameAccessor = ({ name }) => (
  <CountryTitle to="weekly-reports/samoa" component={RouterLink}>
    <Avatar /> {name}
  </CountryTitle>
);

NameAccessor.propTypes = {
  name: PropTypes.number.isRequired,
};

const countriesTableColumns = [
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

export const CountriesTable = () => (
  <DataFetchingTable
    endpoint="countries"
    columns={countriesTableColumns}
    SubComponent={CountrySummaryTable}
  />
);
