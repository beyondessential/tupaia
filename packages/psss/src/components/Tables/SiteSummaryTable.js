/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { CondensedTableBody, FakeHeader, Button } from '@tupaia/ui-components';
import { ConnectedTable } from './ConnectedTable';
import { FIRST_COLUMN_WIDTH, SITES_REPORTED_COLUMN_WIDTH } from './constants';
import { AFRCell, SitesReportedCell } from './TableCellComponents';

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem;
`;

// Todo: update placeholder
const NameCell = data => {
  return <span>{data.name} Clinic</span>;
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
];

// Todo: update placeholder
const TableHeader = () => {
  return <FakeHeader>10/30 Sentinel Sites Reported</FakeHeader>;
};

export const SiteSummaryTable = React.memo(props => {
  // Todo: update placeholder
  const customAction = () => {
    console.log('custom action in CountryWeekSummaryTable. props...', props);
  };

  return (
    <React.Fragment>
      <TableHeader />
      <ConnectedTable
        endpoint="sites"
        columns={siteWeekColumns}
        Header={false}
        Body={CondensedTableBody}
      />
      <StyledDiv>
        <Typography variant="body1">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        </Typography>
        <Button onClick={customAction}>Save and Submit</Button>
      </StyledDiv>
    </React.Fragment>
  );
});
