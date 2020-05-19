/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import MuiBox from '@material-ui/core/Box';
import { Drawer, DrawerHeader, DrawerFooter, Button } from '../src';

export default {
  title: 'Drawer',
};

const Container = styled(MuiBox)`
  max-width: 1200px;
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

const Content = styled.div`
  height: 900px;
  padding: 1rem;
`;

export const drawer = () => {
  const [open, setOpen] = useState(true);

  const toggleDrawer = (event, isOpen) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setOpen(isOpen);
  };

  const handleOpen = event => toggleDrawer(event, true);

  const handleClose = event => toggleDrawer(event, false);

  return (
    <div>
      <Container>
        <Button onClick={handleOpen}>Open drawer</Button>
      </Container>
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
    </div>
  );
};
