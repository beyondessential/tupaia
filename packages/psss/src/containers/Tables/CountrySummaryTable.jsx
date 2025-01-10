import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table, CondensedTableBody, FakeHeader } from '@tupaia/ui-components';
import { COLUMN_WIDTHS } from './constants';
import { AlertCell, SitesReportedCell, WeekAndDateCell } from '../../components';
import { getLatestViewableWeek } from '../../store';
import { useCountryConfirmedWeeklyReport } from '../../api';

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
    CellComponent: AlertCell,
  },
  {
    title: 'DIA',
    key: 'DIA',
    CellComponent: AlertCell,
  },
  {
    title: 'ILI',
    key: 'ILI',
    CellComponent: AlertCell,
  },
  {
    title: 'PF',
    key: 'PF',
    CellComponent: AlertCell,
  },
  {
    title: 'DLI',
    key: 'DLI',
    CellComponent: AlertCell,
  },
];

const NUMBER_OF_WEEKS = 8;

export const CountrySummaryTableComponent = React.memo(({ rowData, period }) => {
  const { isLoading, error, data } = useCountryConfirmedWeeklyReport(
    rowData.organisationUnit,
    period,
    NUMBER_OF_WEEKS,
  );

  return (
    <>
      <FakeHeader>PREVIOUS {NUMBER_OF_WEEKS} WEEKS</FakeHeader>
      <Table
        columns={countrySummaryTableColumns}
        Header={false}
        Body={CondensedTableBody}
        data={data}
        isLoading={isLoading}
        errorMessage={error && error.message}
        rowIdKey="period"
      />
    </>
  );
});

CountrySummaryTableComponent.propTypes = {
  period: PropTypes.string.isRequired,
  rowData: PropTypes.shape({
    organisationUnit: PropTypes.string.isRequired,
  }).isRequired,
};

const mapStateToProps = state => ({
  period: getLatestViewableWeek(state),
});

export const CountrySummaryTable = connect(mapStateToProps)(CountrySummaryTableComponent);
