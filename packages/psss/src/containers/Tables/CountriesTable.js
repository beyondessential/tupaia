/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { connect } from 'react-redux';
import { ExpandableTableBody } from '@tupaia/ui-components';
import { COLUMN_WIDTHS } from './constants';
import { CountrySummaryTable } from './CountrySummaryTable';
import {
  createTotalCasesAccessor,
  AlertCell,
  SitesReportedCell,
  CountryNameLinkCell,
} from '../../components';
import { ConnectedTable } from './ConnectedTable';
import { getEntitiesAllowed } from '../../store';
import PropTypes from 'prop-types';

const countriesTableColumns = [
  {
    title: 'Country',
    key: 'name',
    width: '30%', // must be same as CountrySummaryTable name column to align
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

const CountriesTableComponent = React.memo(({ allowedEntities }) => (
  <ConnectedTable
    endpoint="countries"
    // this may not be needed when the api is complete but is needed for app testing in the meantime
    fetchOptions={{ countries: allowedEntities }}
    columns={countriesTableColumns}
    Body={ExpandableTableBody}
    SubComponent={CountrySummaryTable}
  />
));

CountriesTableComponent.propTypes = {
  allowedEntities: PropTypes.array,
};

CountriesTableComponent.defaultProps = {
  allowedEntities: [],
};

const mapStateToProps = state => ({
  allowedEntities: getEntitiesAllowed(state),
});

export const CountriesTable = connect(mapStateToProps)(CountriesTableComponent);
