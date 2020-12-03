/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { ExpandableTable, ExpandableTableBody } from '@tupaia/ui-components';
import { COLUMN_WIDTHS } from './constants';
import { CountrySummaryTable } from './CountrySummaryTable';
import { useConfirmedWeeklyReport } from '../../api';
import { AlertCell, SitesReportedCell, CountryNameLinkCell } from '../../components';
import { getLatestViewableWeek, getEntitiesAllowed } from '../../store';
import { connect } from 'react-redux';

const countriesTableColumns = [
  {
    title: 'Country',
    key: 'organisationUnit',
    width: '30%', // must be same as CountrySummaryTable name column to align
    align: 'left',
    sortable: false,
    CellComponent: CountryNameLinkCell,
  },
  {
    title: 'Sites Reported',
    key: 'Sites Reported',
    CellComponent: SitesReportedCell,
    sortable: false,
    width: COLUMN_WIDTHS.SITES_REPORTED,
  },
  {
    title: 'AFR',
    key: 'AFR',
    CellComponent: AlertCell,
    sortable: false,
  },
  {
    title: 'DIA',
    key: 'DIA',
    CellComponent: AlertCell,
    sortable: false,
  },
  {
    title: 'ILI',
    key: 'ILI',
    CellComponent: AlertCell,
    sortable: false,
  },
  {
    title: 'PF',
    key: 'PF',
    CellComponent: AlertCell,
    sortable: false,
  },
  {
    title: 'DLI',
    key: 'DLI',
    CellComponent: AlertCell,
    sortable: false,
  },
];

export const CountriesTableComponent = ({ period, countryCodes }) => {
  const { data, isLoading, error } = useConfirmedWeeklyReport(period, countryCodes);

  return (
    <ExpandableTable
      data={data}
      isLoading={isLoading}
      errorMessage={error && error.message}
      columns={countriesTableColumns}
      Body={ExpandableTableBody}
      rowIdKey="organisationUnit"
      SubComponent={CountrySummaryTable}
    />
  );
};

CountriesTableComponent.propTypes = {
  period: PropTypes.string.isRequired,
  countryCodes: PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
  period: getLatestViewableWeek(state),
  countryCodes: getEntitiesAllowed(state),
});

export const CountriesTable = connect(mapStateToProps)(CountriesTableComponent);
