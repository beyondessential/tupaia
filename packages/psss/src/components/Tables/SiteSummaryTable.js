/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import {
  Drawer,
  DrawerFooter,
  DrawerHeader,
  CondensedTableBody,
  FakeHeader,
  Button,
} from '@tupaia/ui-components';
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

const Content = styled.div`
  height: 900px;
  padding: 1rem;
`;

const Action = () => {
  const handleClick = () => {
    console.log('click');
  };
  return (
    <Button fullWidth onClick={handleClick}>
      Submit now
    </Button>
  );
};

const ConfirmDrawer = () => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (event, isOpen) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setOpen(isOpen);
  };

  const handleOpen = event => toggleDrawer(event, true);

  const handleClose = event => toggleDrawer(event, false);

  return (
    <React.Fragment>
      <Button onClick={handleOpen}>Save and submit</Button>
      <Drawer open={open} onClose={handleClose}>
        <DrawerHeader
          title="American Samoa"
          date="Week 9 Feb 25 - Mar 1, 20202"
          onClose={handleClose}
        />
        <Content>
          <Typography variant="h3" gutterBottom>
            Example content heading
          </Typography>
          <Typography variant="body1" gutterBottom>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium adipisci
            cupiditate distinctio dolores ea explicabo fugit inventore, itaque nostrum obcaecati
            quas, quis sint suscipit ut voluptates. Fugit neque quidem repellendus.
          </Typography>
        </Content>
        <DrawerFooter
          Action={Action}
          helperText="Verify data to submit Weekly Report to Regional"
        />
      </Drawer>
    </React.Fragment>
  );
};

export const SiteSummaryTable = React.memo(({ data }) => {
  console.log('data', data);
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
        <ConfirmDrawer data={data} />
      </StyledDiv>
    </React.Fragment>
  );
});
