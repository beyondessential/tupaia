/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import MuiLink from '@material-ui/core/Link';
import { CondensedTableBody, FakeHeader, Table, Button } from '@tupaia/ui-components';
import { COLUMN_WIDTHS } from './constants';
import { createTotalCasesAccessor, AlertCell } from '../../components';
import { openWeeklyReportsPanel } from '../../store';
import { useTableQuery, getSitesMetaData } from '../../api';

// Todo: update placeholder
const NameCell = data => {
  return <span>{data.name}</span>;
};

const siteWeekColumns = [
  {
    title: 'Name',
    key: 'name',
    width: '190px', // must be same width as CountryTable weekNumber column to align
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
    title: 'DLI',
    key: 'DLI',
    accessor: createTotalCasesAccessor('dli'),
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
`;

const TableWrapper = styled.div`
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

const Text = styled(Typography)`
  font-size: 0.8rem;
  color: ${props => props.theme.palette.text.secondary};
`;

const Link = styled(MuiLink)`
  font-size: 0.68rem;
`;

export const SiteSummaryTableComponent = React.memo(({ rowData, handleOpen }) => {
  const { countryCode } = useParams();
  const options = {
    countryCode,
    weekNumber: rowData.weekNumber,
  };
  const { error, data } = useTableQuery('sites', options);
  const { data: sitesMetaData } = useQuery(['sites-meta-data', options], getSitesMetaData);

  const showSites = false;
  // const showSites = sitesMetaData?.sites?.length > 0 && data?.data?.length > 0;

  return (
    <>
      {showSites && (
        <TableWrapper>
          <FakeHeader>
            <div>10/30 Sentinel Sites Reported</div>
            <Link component="button" onClick={handleOpen} underline="always">
              Review and Confirm Now
            </Link>
          </FakeHeader>
          <Table
            errorMessage={error}
            columns={siteWeekColumns}
            data={data ? data.data : 0}
            Header={false}
            Body={CondensedTableBody}
          />
        </TableWrapper>
      )}
      <TableFooter>
        <Text>Verify data to submit Weekly report to Regional</Text>
        <Button onClick={handleOpen}>Review and Confirm Now</Button>
      </TableFooter>
    </>
  );
});

SiteSummaryTableComponent.propTypes = {
  handleOpen: PropTypes.func.isRequired,
  rowData: PropTypes.shape({
    weekNumber: PropTypes.number,
  }).isRequired,
};

const mapDispatchToProps = dispatch => ({
  handleOpen: () => dispatch(openWeeklyReportsPanel()),
});

export const SiteSummaryTable = connect(null, mapDispatchToProps)(SiteSummaryTableComponent);
