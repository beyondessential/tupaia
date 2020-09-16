/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { format } from 'date-fns';
import { Table } from '@tupaia/ui-components';
import { Alarm, CheckCircleOutline } from '@material-ui/icons';
import { CountryTableBody } from './CountryTableBody';
import * as COLORS from '../../constants/colors';
import { COLUMN_WIDTHS } from './constants';
import { createTotalCasesAccessor, AlertCell, SitesReportedCell } from '../../components';
import {
  getCountryWeeks,
  reloadCountryWeeks,
  getCountryWeeksError,
  checkCountryWeekIsLoading,
} from '../../store';

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

const NameCell = ({ weekNumber, startDate, endDate }) => {
  const start = `${format(new Date(startDate), 'LLL d')}`;
  const end = `${format(new Date(endDate), 'LLL d, yyyy')}`;
  return (
    <>
      <CountryWeekTitle>{`Week ${weekNumber}`}</CountryWeekTitle>
      <CountryWeekSubTitle>{`${start} - ${end}`}</CountryWeekSubTitle>
    </>
  );
};

NameCell.propTypes = {
  weekNumber: PropTypes.number.isRequired,
  startDate: PropTypes.any.isRequired,
  endDate: PropTypes.any.isRequired,
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
  if (status === 'Overdue') {
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
  status: PropTypes.string.isRequired,
};

const countryColumns = [
  {
    title: 'Date ',
    key: 'weekNumber',
    width: COLUMN_WIDTHS.FIRST,
    align: 'left',
    CellComponent: NameCell,
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
  {
    title: 'STATUS',
    key: 'status',
    width: '110px',
    CellComponent: StatusCell,
  },
];

const CountryTableComponent = React.memo(({ fetchData, data, isLoading, errorMessage }) => {
  const [page, setPage] = useState(0);

  useEffect(() => {
    (async () => {
      await fetchData({ page });
    })();
  }, [fetchData, page]);

  return (
    <Table
      isLoading={isLoading}
      columns={countryColumns}
      data={data}
      errorMessage={errorMessage}
      onChangePage={setPage}
      page={page}
      Body={CountryTableBody}
      fetchData={fetchData}
    />
  );
});

CountryTableComponent.propTypes = {
  fetchData: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  errorMessage: PropTypes.string,
};

CountryTableComponent.defaultProps = {
  isLoading: false,
  errorMessage: '',
};

const mapStateToProps = state => ({
  data: getCountryWeeks(state),
  isLoading: checkCountryWeekIsLoading(state),
  error: getCountryWeeksError(state),
});

const mapDispatchToProps = dispatch => ({
  fetchData: () => dispatch(reloadCountryWeeks({})),
});

export const CountryTable = connect(mapStateToProps, mapDispatchToProps)(CountryTableComponent);
