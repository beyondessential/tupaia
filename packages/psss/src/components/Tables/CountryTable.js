/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useEffect } from 'react';
import { Table } from '@tupaia/ui-components';
import { format } from 'date-fns';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alarm, CheckCircleOutline } from '@material-ui/icons';
import { SiteSummaryTable } from './SiteSummaryTable';
import * as COLORS from '../../theme/colors';
import { FIRST_COLUMN_WIDTH, SITES_REPORTED_COLUMN_WIDTH } from './constants';
import { AFRCell, SitesReportedCell } from './TableCellComponents';
import { getCountryWeeks, reloadCountryWeeks } from '../../store';

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

const NameCell = ({ week, startDate, endDate }) => {
  const start = `${format(startDate, 'LLL d')}`;
  const end = `${format(endDate, 'LLL d')}`;
  const year = `${format(endDate, 'yyyy')}`;
  return (
    <React.Fragment>
      <CountryWeekTitle>{`Week ${week}`}</CountryWeekTitle>
      <CountryWeekSubTitle>{`${start} - ${end}, ${year}`}</CountryWeekSubTitle>
    </React.Fragment>
  );
};

NameCell.propTypes = {
  week: PropTypes.number.isRequired,
  startDate: PropTypes.instanceOf(Date).isRequired,
  endDate: PropTypes.instanceOf(Date).isRequired,
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
    key: 'week',
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
    CellComponent: AFRCell,
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
  {
    title: 'STATUS',
    key: 'status',
    width: '110px',
    CellComponent: StatusCell,
  },
];

const DEFAULT_ROWS_PER_PAGE = 10;
const DEFAULT_FETCH_STATE = { errorMessage: '', isLoading: true };

/*
 * Country Table Component
 */
const CountryTableComponent = React.memo(({ fetchOptions, fetchData, data }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [fetchState, setFetchState] = useState(DEFAULT_FETCH_STATE);

  useEffect(() => {
    let updateFetchState = newFetchState =>
      setFetchState(prevFetchState => ({ ...prevFetchState, ...newFetchState }));

    updateFetchState({ isLoading: true });
    (async () => {
      try {
        await fetchData({ page, rowsPerPage });
        updateFetchState({
          ...DEFAULT_FETCH_STATE,
          isLoading: false,
        });
      } catch (error) {
        updateFetchState({ errorMessage: error.message, isLoading: false });
      }
    })();

    return () => {
      updateFetchState = () => {}; // discard the fetch state update if this request is stale
    };
  }, [page, rowsPerPage, fetchOptions]);

  const count = data.length;
  const { isLoading, errorMessage } = fetchState;

  return (
    <Table
      isLoading={isLoading}
      columns={countryColumns}
      data={data}
      errorMessage={errorMessage}
      rowsPerPage={rowsPerPage}
      page={page}
      count={count}
      onChangePage={setPage}
      onChangeRowsPerPage={setRowsPerPage}
      SubComponent={SiteSummaryTable}
    />
  );
});

CountryTableComponent.propTypes = {
  fetchData: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  fetchOptions: PropTypes.object,
};

CountryTableComponent.defaultProps = {
  fetchOptions: null,
};

const mapStateToProps = state => ({
  data: getCountryWeeks(state),
});

const mapDispatchToProps = dispatch => ({
  fetchData: () => dispatch(reloadCountryWeeks({})),
});

export const CountryTable = connect(mapStateToProps, mapDispatchToProps)(CountryTableComponent);
