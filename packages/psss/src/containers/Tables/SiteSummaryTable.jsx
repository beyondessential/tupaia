import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import MuiLink from '@material-ui/core/Link';
import { CondensedTableBody, FakeHeader, Table, Button } from '@tupaia/ui-components';
import { COLUMN_WIDTHS } from './constants';
import { AlertCell } from '../../components';
import { openWeeklyReportsPanel } from '../../store';
import { useCountrySitesWeeklyReport } from '../../api';

const siteWeekColumns = [
  {
    title: 'Name',
    key: 'name',
    width: COLUMN_WIDTHS.WEEKLY_REPORT_DATE,
    align: 'left',
  },
  {
    title: 'Sites Reported',
    key: 'sitesReported',
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
  {
    title: 'Status',
    key: 'status',
    width: '165px',
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
  const { period, Sites: totalSites = '', 'Sites Reported': sitesReported = '' } = rowData;
  const { isLoading, isFetching, error, data } = useCountrySitesWeeklyReport(countryCode, period);

  return (
    <>
      <TableWrapper>
        <FakeHeader>
          <div>{`${sitesReported}/${totalSites} Sentinel Sites Reported`}</div>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <Link component="button" onClick={() => handleOpen(period)} underline="always">
            Review and Confirm Now
          </Link>
        </FakeHeader>
        <Table
          isLoading={isLoading}
          isFetching={!isLoading && isFetching}
          errorMessage={error?.message}
          noDataMessage="No sentinel sites found"
          columns={siteWeekColumns}
          data={data}
          Header={false}
          Body={CondensedTableBody}
        />
      </TableWrapper>
      <TableFooter>
        <Text>Verify data to submit Weekly report to Regional</Text>
        <Button onClick={() => handleOpen(period)}>Review and Confirm Now</Button>
      </TableFooter>
    </>
  );
});

SiteSummaryTableComponent.propTypes = {
  handleOpen: PropTypes.func.isRequired,
  rowData: PropTypes.shape({
    Sites: PropTypes.number,
    'Sites Reported': PropTypes.number,
    period: PropTypes.string,
  }).isRequired,
};

const mapDispatchToProps = dispatch => ({
  handleOpen: period => dispatch(openWeeklyReportsPanel(period)),
});

export const SiteSummaryTable = connect(null, mapDispatchToProps)(SiteSummaryTableComponent);
