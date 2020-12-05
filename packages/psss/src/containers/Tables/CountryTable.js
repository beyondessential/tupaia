/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import differenceInWeeks from 'date-fns/difference_in_weeks';
import { getCurrentPeriod } from '@tupaia/utils';
import { useParams } from 'react-router-dom';
import { ExpandableTable, TablePaginator } from '@tupaia/ui-components';
import { Alarm, CheckCircleOutline } from '@material-ui/icons';
import * as COLORS from '../../constants/colors';
import { COLUMN_WIDTHS } from './constants';
import { getDisplayDatesByPeriod, getWeekNumberByPeriod, subtractPeriod } from '../../utils';
import { AlertCell, SitesReportedCell } from '../../components';
import { REPORT_STATUSES } from '../../constants';
import { SiteSummaryTable } from './SiteSummaryTable';
import { useCountryWeeklyReport } from '../../api/queries';

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

const Status = styled.div`
  display: inline-flex;
  color: ${props => props.color};
  align-items: center;
  text-transform: uppercase;
  font-weight: 500;
  font-size: 0.6875rem;
  line-height: 1;
  padding-left: 1rem;
  text-align: left;
  width: 100%;

  .MuiSvgIcon-root {
    width: 1.375rem;
    height: 1.375rem;
    margin-right: 0.3125rem;
  }
`;

const StatusCell = ({ status }) => {
  if (status === REPORT_STATUSES.OVERDUE) {
    return (
      <Status color={COLORS.ORANGE}>
        <Alarm />
        {status}
      </Status>
    );
  }

  return (
    <Status color={COLORS.TEXT_LIGHTGREY}>
      <CheckCircleOutline />
      {status}
    </Status>
  );
};

StatusCell.propTypes = {
  status: PropTypes.string,
};

StatusCell.defaultProps = {
  status: REPORT_STATUSES.SUBMITTED,
};

const countryColumns = [
  {
    title: 'Date ',
    key: 'weekNumber',
    width: '190px', // must be same width as SiteSummaryTable name column to align
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

const DEFAULT_NUMBER_OF_WEEKS = 10;
const TOTAL_RECORDS = differenceInWeeks(new Date(), new Date(2016, 1, 1));

// console.log('TOTAL_RECORDS', TOTAL_RECORDS);

export const CountryTable = () => {
  const { countryCode } = useParams();

  // Todo: move pagination to use table data hook if possible
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_NUMBER_OF_WEEKS);

  const defaultPeriod = getCurrentPeriod('WEEK');

  const period = subtractPeriod(defaultPeriod, page * rowsPerPage);

  const { isLoading, error, data, isFetching } = useCountryWeeklyReport(
    countryCode,
    period,
    rowsPerPage,
  );

  return (
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
  );
};
