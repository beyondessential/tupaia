/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import { CondensedTableBody, FakeHeader, Table, Button } from '@tupaia/ui-components';
import { FIRST_COLUMN_WIDTH, SITES_REPORTED_COLUMN_WIDTH } from './constants';
import { AlertCell } from './TableCellComponents';
import { createDataAccessor } from './dataAccessors';
import { getSiteWeeksError, getSiteWeeks, reloadSiteWeeks } from '../../store';

// Todo: update placeholder
const NameCell = data => {
  return <span>{data.name}</span>;
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
    accessor: createDataAccessor('sitesReported'),
    width: SITES_REPORTED_COLUMN_WIDTH,
  },
  {
    title: 'AFR',
    key: 'AFR',
    accessor: createDataAccessor('afr'),
    CellComponent: AlertCell,
  },
  {
    title: 'DIA',
    key: 'DIA',
    accessor: createDataAccessor('dia'),
    CellComponent: AlertCell,
  },
  {
    title: 'ILI',
    key: 'ILI',
    accessor: createDataAccessor('ili'),
    CellComponent: AlertCell,
  },
  {
    title: 'PF',
    key: 'PF',
    accessor: createDataAccessor('pf'),
    CellComponent: AlertCell,
  },
  {
    title: 'DIL',
    key: 'DIL',
    accessor: createDataAccessor('dil'),
    CellComponent: AlertCell,
  },
  {
    title: 'Status',
    key: 'status',
    width: '110px',
    accessor: createDataAccessor('status'),
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

export const SiteSummaryTableComponent = React.memo(({ fetchData, data, errorMessage }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await fetchData();
      setIsLoading(false);
    })();
  }, []);

  return (
    <React.Fragment>
      <TableHeader />
      <Table
        isLoading={isLoading}
        errorMessage={errorMessage}
        columns={siteWeekColumns}
        fetchData={fetchData}
        data={data}
        Header={false}
        Body={CondensedTableBody}
      />
      <StyledDiv>
        <Typography variant="body1">Verify data to submit Weekly report to Regional</Typography>
        <Button>Review and Confirm Now</Button>
      </StyledDiv>
    </React.Fragment>
  );
});

SiteSummaryTableComponent.propTypes = {
  fetchData: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  errorMessage: PropTypes.string,
};

SiteSummaryTableComponent.defaultProps = {
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
