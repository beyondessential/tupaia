/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import styled from 'styled-components';
import React from 'react';
import MuiLink from '@material-ui/core/Link';
import Avatar from '@material-ui/core/Avatar';
import PropTypes from 'prop-types';
import { ExpandableTableBody } from '@tupaia/ui-components';
import { Link as RouterLink } from 'react-router-dom';
import { ConnectedTable } from './ConnectedTable';
import * as COLORS from '../../theme/colors';
import { FIRST_COLUMN_WIDTH, SITES_REPORTED_COLUMN_WIDTH } from './constants';
import { CountrySummaryTable } from './CountrySummaryTable';
import { createDataAccessor } from './createDataAccessors';
import { AlertCell, SitesReportedCell } from './TableCellComponents';

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

const NameCell = ({ name }) => (
  <CountryTitle to="weekly-reports/samoa" component={RouterLink}>
    <Avatar /> {name}
  </CountryTitle>
);

NameCell.propTypes = {
  name: PropTypes.string.isRequired,
};

const countriesTableColumns = [
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
    accessor: createDataAccessor('afr'),
    CellComponent: AlertCell,
  },
  {
    title: 'DIA',
    key: 'DIA',
    accessor: createDataAccessor('dia'),
    CellComponent: AlertCell,
  },
  {
    title: 'ILI',
    key: 'ILI',
    accessor: createDataAccessor('ili'),
    CellComponent: AlertCell,
  },
  {
    title: 'PF',
    key: 'PF',
    accessor: createDataAccessor('pf'),
    CellComponent: AlertCell,
  },
  {
    title: 'DIO',
    key: 'DIL',
    accessor: createDataAccessor('dil'),
    CellComponent: AlertCell,
  },
];

export const CountriesTable = React.memo(() => (
  <ConnectedTable
    endpoint="countries"
    columns={countriesTableColumns}
    Body={ExpandableTableBody}
    SubComponent={CountrySummaryTable}
  />
));
