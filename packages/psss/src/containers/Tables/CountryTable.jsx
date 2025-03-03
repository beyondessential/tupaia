import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import differenceInWeeks from 'date-fns/differenceInWeeks';
import { useParams } from 'react-router-dom';
import { ExpandableTable, TablePaginator } from '@tupaia/ui-components';
import * as COLORS from '../../constants/colors';
import { COLUMN_WIDTHS } from './constants';
import { getDisplayDatesByPeriod, getWeekNumberByPeriod, getCurrentPeriod } from '../../utils';
import { StatusCell, AlertCell, SitesReportedCell } from '../../components';
import { MIN_DATE } from '../../constants';
import { SiteSummaryTable } from './SiteSummaryTable';
import { useCountryWeeklyReport } from '../../api/queries';
import { WeeklyReportsPanel } from '../Panels';

const CountryWeekTitle = styled.div`
  color: ${COLORS.BLUE};
  font-weight: 500;
  font-size: 1rem;
  line-height: 1.2rem;
  margin-bottom: 3px;
`;

const CountryWeekSubTitle = styled.div`
  color: ${COLORS.TEXT_DARKGREY};
  font-size: 0.875rem;
  line-height: 1rem;
`;

const NameCell = ({ period }) => (
  <>
    <CountryWeekTitle>{`Week ${getWeekNumberByPeriod(period)}`}</CountryWeekTitle>
    <CountryWeekSubTitle>{getDisplayDatesByPeriod(period)}</CountryWeekSubTitle>
  </>
);

NameCell.propTypes = {
  period: PropTypes.string.isRequired,
};

const countryColumns = [
  {
    title: 'Date ',
    key: 'period',
    width: COLUMN_WIDTHS.WEEKLY_REPORT_DATE,
    align: 'left',
    CellComponent: NameCell,
    sortable: false,
  },
  {
    title: 'Sites Reported',
    key: 'Sites Reported',
    CellComponent: SitesReportedCell,
    width: COLUMN_WIDTHS.SITES_REPORTED,
    sortable: false,
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
  {
    title: 'STATUS',
    key: 'status',
    width: '165px',
    CellComponent: StatusCell,
    sortable: false,
  },
];

const TOTAL_RECORDS = differenceInWeeks(new Date(), MIN_DATE);

export const CountryTable = () => {
  const { countryCode } = useParams();
  const period = getCurrentPeriod();

  const {
    isLoading,
    error,
    data,
    isFetching,
    startWeek,
    endWeek,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
  } = useCountryWeeklyReport(countryCode, period, TOTAL_RECORDS);

  return (
    <>
      <ExpandableTable
        data={data}
        isLoading={isLoading}
        isFetching={!isLoading && isFetching}
        columns={countryColumns}
        rowIdKey="period"
        errorMessage={error && error.message}
        SubComponent={SiteSummaryTable}
        Paginator={props => (
          <TablePaginator
            {...props}
            disabled={isFetching}
            rowsPerPage={rowsPerPage}
            onChangeRowsPerPage={setRowsPerPage}
            onChangePage={p => setPage(p)}
            page={page}
            count={TOTAL_RECORDS}
          />
        )}
      />
      <WeeklyReportsPanel pageQueryKey={{ startWeek, endWeek }} />
    </>
  );
};
