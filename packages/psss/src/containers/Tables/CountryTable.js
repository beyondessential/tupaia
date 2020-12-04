/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { ExpandableTable } from '@tupaia/ui-components';
import { Alarm, CheckCircleOutline } from '@material-ui/icons';
import { CountryTableBody } from './CountryTableBody';
import * as COLORS from '../../constants/colors';
import { COLUMN_WIDTHS } from './constants';
import { getDisplayDatesByPeriod, getWeekNumberByPeriod } from '../../utils';
import { AlertCell, SitesReportedCell } from '../../components';
import { REPORT_STATUSES } from '../../constants';

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

export const CountryTable = React.memo(
  ({ data, isLoading, errorMessage, isFetching, Paginator }) => {
    return (
      <ExpandableTable
        isFetching={!isLoading && isFetching}
        isLoading={isLoading}
        columns={countryColumns}
        data={data}
        errorMessage={errorMessage}
        Body={CountryTableBody}
        Paginator={Paginator}
      />
    );
  },
);

CountryTable.propTypes = {
  data: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  isFetching: PropTypes.bool,
  errorMessage: PropTypes.string,
  Paginator: PropTypes.any,
};

CountryTable.defaultProps = {
  isFetching: false,
  isLoading: false,
  errorMessage: '',
  Paginator: null,
};
