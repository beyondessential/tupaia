/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import { CondensedTableBody, FakeHeader, Table } from '@tupaia/ui-components';
import { WeeklyReportPanel } from '../WeeklyReportPanel';
import { FIRST_COLUMN_WIDTH, SITES_REPORTED_COLUMN_WIDTH } from './constants';
import { AlertCell } from './TableCellComponents';
import {
  getSiteWeeksError,
  checkSiteWeeksIsLoading,
  getSiteWeeks,
  reloadSiteWeeks,
} from '../../store';

// Todo: update placeholder
const NameCell = data => {
  return <span>{data.name}</span>;
};

const dataAccessor = key => data => {
  const indicator = data.indicators.find(i => i.id === key);
  return indicator ? indicator.totalCases : null;
};

const siteWeekColumns = [
  {
    title: 'Name',
    key: 'name',
    width: FIRST_COLUMN_WIDTH,
    align: 'left',
    CellComponent: NameCell,
  },
  {
    title: 'Sites Reported',
    key: 'sitesReported',
    accessor: dataAccessor('sitesReported'),
    width: SITES_REPORTED_COLUMN_WIDTH,
  },
  {
    title: 'AFR',
    key: 'AFR',
    accessor: dataAccessor('afr'),
    CellComponent: AlertCell,
  },
  {
    title: 'DIA',
    key: 'DIA',
    accessor: dataAccessor('dia'),
    CellComponent: AlertCell,
  },
  {
    title: 'ILI',
    key: 'ILI',
    accessor: dataAccessor('ili'),
    CellComponent: AlertCell,
  },
  {
    title: 'PF',
    key: 'PF',
    accessor: dataAccessor('pf'),
    CellComponent: AlertCell,
  },
  {
    title: 'DIL',
    key: 'DIL',
    accessor: dataAccessor('dil'),
  },
  {
    title: 'Status',
    key: 'status',
    width: '110px',
    accessor: dataAccessor('status'),
  },
];

// Todo: update placeholder
const TableHeader = () => {
  return <FakeHeader>10/30 Sentinel Sites Reported</FakeHeader>;
};

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem;
`;

export const SiteSummaryTableComponent = React.memo(
  ({ fetchData, data, fetchOptions, errorMessage }) => {
    const [page, setPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      (async () => {
        setIsLoading(true);
        await fetchData({ page });
        console.log('stop loading');
        setIsLoading(false);
      })();
    }, [page, fetchOptions]);

    return (
      <React.Fragment>
        <TableHeader />
        <Table
          isLoading={isLoading}
          errorMessage={errorMessage}
          columns={siteWeekColumns}
          fetchData={fetchData}
          onChangePage={setPage}
          page={page}
          fetchOptions={fetchOptions}
          data={data}
          Header={false}
          Body={CondensedTableBody}
        />
        <StyledDiv>
          <Typography variant="body1">Verify data to submit Weekly report to Regional</Typography>
          {data.length && <WeeklyReportPanel />}
        </StyledDiv>
      </React.Fragment>
    );
  },
);

SiteSummaryTableComponent.propTypes = {
  fetchData: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  fetchOptions: PropTypes.object,
  errorMessage: PropTypes.string,
};

SiteSummaryTableComponent.defaultProps = {
  fetchOptions: null,
  errorMessage: '',
};

const mapStateToProps = state => ({
  data: getSiteWeeks(state),
  errorMessage: getSiteWeeksError(state),
});

const mapDispatchToProps = dispatch => ({
  fetchData: () => dispatch(reloadSiteWeeks({})),
});

export const SiteSummaryTable = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SiteSummaryTableComponent);
