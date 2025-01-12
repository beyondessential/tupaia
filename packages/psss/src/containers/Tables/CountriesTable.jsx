import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ExpandableTable, ExpandableTableBody } from '@tupaia/ui-components';
import { COLUMN_WIDTHS } from './constants';
import { CountrySummaryTable } from './CountrySummaryTable';
import { useConfirmedWeeklyReport } from '../../api';
import { AlertCell, CountryLinkCell, SitesReportedCell } from '../../components';
import { getCountryCodes, getLatestViewableWeek } from '../../store';

const CountryCell = ({ organisationUnit }) => (
  <CountryLinkCell
    target={`weekly-reports/${organisationUnit}`}
    organisationUnit={organisationUnit}
  />
);
CountryCell.propTypes = {
  organisationUnit: PropTypes.string.isRequired,
};

const countriesTableColumns = [
  {
    title: 'Country',
    key: 'organisationUnit',
    width: '30%', // must be same as CountrySummaryTable name column to align
    align: 'left',
    sortable: false,
    CellComponent: CountryCell,
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
  const { data, isLoading, error, isFetching } = useConfirmedWeeklyReport(period, countryCodes);

  return (
    <ExpandableTable
      data={data}
      isLoading={isLoading}
      isFetching={!isLoading && isFetching}
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
  countryCodes: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const mapStateToProps = state => ({
  period: getLatestViewableWeek(state),
  countryCodes: getCountryCodes(state),
});

export const CountriesTable = connect(mapStateToProps)(CountriesTableComponent);
