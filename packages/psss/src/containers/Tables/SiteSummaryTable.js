/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import MuiLink from '@material-ui/core/Link';
import { CondensedTableBody, FakeHeader, Table, Button } from '@tupaia/ui-components';
import { COLUMN_WIDTHS } from './constants';
import { createTotalCasesAccessor, AlertCell } from '../../components';
import {
  openWeeklyReportsPanel,
  getSitesForWeekError,
  getSitesForWeek,
  reloadSitesForWeek,
  checkSitesForWeekIsLoading,
} from '../../store';

// Todo: update placeholder
const NameCell = data => {
  return <span>{data.name}</span>;
};

const siteWeekColumns = [
  {
    title: 'Name',
    key: 'name',
    width: COLUMN_WIDTHS.FIRST,
    align: 'left',
    CellComponent: NameCell,
  },
  {
    title: 'Sites Reported',
    key: 'sitesReported',
    accessor: createTotalCasesAccessor('sitesReported'),
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
    title: 'Status',
    key: 'status',
    width: '110px',
    accessor: createTotalCasesAccessor('status'),
  },
];

const TableFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.3rem 1.3rem;
  border-top: 1px solid ${props => props.theme.palette.grey['400']};
`;

const Text = styled(Typography)`
  font-size: 0.8rem;
  color: ${props => props.theme.palette.text.secondary};
`;

const Link = styled(MuiLink)`
  font-size: 0.68rem;
`;

export const SiteSummaryTableComponent = React.memo(
  ({ fetchData, data, handleOpen, isLoading, errorMessage }) => {
    useEffect(() => {
      (async () => {
        await fetchData();
      })();
    }, [fetchData]);

    return (
      <>
        <FakeHeader>
          <div>10/30 Sentinel Sites Reported</div>
          <Link component="button" onClick={handleOpen} underline="always">
            Review and Confirm Now
          </Link>
        </FakeHeader>
        <Table
          isLoading={isLoading}
          errorMessage={errorMessage}
          columns={siteWeekColumns}
          fetchData={fetchData}
          data={data}
          Header={false}
          Body={CondensedTableBody}
        />
        <TableFooter>
          <Text>Verify data to submit Weekly report to Regional</Text>
          <Button onClick={handleOpen}>Review and Confirm Now</Button>
        </TableFooter>
      </>
    );
  },
);

SiteSummaryTableComponent.propTypes = {
  fetchData: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  handleOpen: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  errorMessage: PropTypes.string,
};

SiteSummaryTableComponent.defaultProps = {
  isLoading: false,
  errorMessage: '',
};

const mapStateToProps = state => ({
  data: getSitesForWeek(state),
  isLoading: checkSitesForWeekIsLoading(state),
  errorMessage: getSitesForWeekError(state),
});

const mapDispatchToProps = dispatch => ({
  fetchData: () => dispatch(reloadSitesForWeek({})),
  handleOpen: () => dispatch(openWeeklyReportsPanel()),
});

export const SiteSummaryTable = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SiteSummaryTableComponent);
