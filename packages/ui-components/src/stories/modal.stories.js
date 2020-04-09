/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import * as COLORS from '../theme/colors';

export default {
  title: 'Modal',
};

const Container = styled.div`
  max-width: 1200px;
  width: 100vw;
  height: 100vh;
  padding: 3rem;
  background-color: ${COLORS.LIGHTGREY};
  
  .MuiCard-root {
      max-width: 330px;
  }
`;

export const modal = () => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Container>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Heading
          </Typography>
          <Typography variant="body2" gutterBottom>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur
            unde suscipit, quam beatae rerum inventore consectetur, neque doloribus, cupiditate
            numquam dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam.
          </Typography>
          <br/>
          <Button onClick={handleClickOpen}>Open modal</Button>
        </CardContent>
      </Card>
      <Modal open={open} onClose={handleClose} />
    </Container>
  );
};
