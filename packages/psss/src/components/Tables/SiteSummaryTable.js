/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import { tableColumnShape, CondensedTableBody, FakeHeader } from '@tupaia/ui-components';
import MuiTableFooter from '@material-ui/core/TableFooter';
import MuiTableCell from '@material-ui/core/TableCell';
import MuiTableRow from '@material-ui/core/TableRow';
import { ConnectedTable } from './ConnectedTable';
import { WeeklyReportPane } from '../WeeklyReportPane';
import { FIRST_COLUMN_WIDTH, SITES_REPORTED_COLUMN_WIDTH } from './constants';
import { AlertCell } from './TableCellComponents';

// Todo: update placeholder
const NameCell = data => {
  return <span>{data.name}</span>;
};

const dataAccessor = key => {
  return data => {
    const indicator = data.indicators.find(i => i.id === key);
    return indicator ? indicator.totalCases : null;
  };
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
    title: 'DLI',
    key: 'DLI',
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

const TableFooter = ({ columns, data }) => {
  return (
    <MuiTableFooter>
      <MuiTableRow>
        <MuiTableCell colSpan={columns.length}>
          <StyledDiv>
            <Typography variant="body1">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
            </Typography>
            {data.length && <WeeklyReportPane data={data} />}
          </StyledDiv>
        </MuiTableCell>
      </MuiTableRow>
    </MuiTableFooter>
  );
};

TableFooter.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.array.isRequired,
};

export const SiteSummaryTable = React.memo(() => {
  return (
    <React.Fragment>
      <TableHeader />
      <ConnectedTable
        endpoint="sites"
        columns={siteWeekColumns}
        Header={false}
        Body={CondensedTableBody}
        Paginator={TableFooter}
      />
    </React.Fragment>
  );
});
