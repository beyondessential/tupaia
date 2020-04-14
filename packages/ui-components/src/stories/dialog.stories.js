/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '../components/Dialog';
import { Button, TextButton } from '../components/Button';
import styled from 'styled-components';
import { CircleTick } from '../components/Icons';
import * as COLORS from '../theme/colors';
import Typography from '@material-ui/core/Typography';

export default {
  title: 'Modal',
};

const Container = styled.div`
  padding: 1rem;
`;

export const modal = () => {
  const [open, setOpen] = useState(true);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Container>
      <Dialog onClose={handleClose} open={open}>
        <DialogTitle onClose={handleClose}>Archive Alert</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Confirm</Button>
        </DialogActions>
      </Dialog>
      <Button onClick={handleClickOpen}>Open modal</Button>
    </Container>
  );
};

export const TwoTone = () => {
  const [open, setOpen] = useState(true);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Container>
      <Dialog onClose={handleClose} open={open}>
        <DialogTitle onClose={handleClose}>Archive Alert</DialogTitle>
        <DialogContent greyBackground>
          <DialogContentText>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </DialogContentText>
        </DialogContent>
        <DialogContent>
          <DialogContentText>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Confirm</Button>
        </DialogActions>
      </Dialog>
      <Button onClick={handleClickOpen}>Open modal</Button>
    </Container>
  );
};

const StyledContent = styled.div`
  padding: 2rem 1rem;
  text-align: center;

  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: ${props => props.theme.palette.success.main};
  }

  h2 {
    margin-bottom: 1.5rem;
  }

  h5 {
    display: inline-block;
    max-width: 400px;
    color: ${COLORS.GREY_72};
  }

  button {
    margin-left: 1rem;
  }
`;

export const customContent = () => {
  const [open, setOpen] = useState(true);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Container>
      <Dialog disableBackdropClick onClose={handleClose} open={open}>
        <DialogTitle onClose={handleClose}>Outbreak</DialogTitle>
        <DialogContent>
          <StyledContent>
            <CircleTick />
            <Typography variant="h2" gutterBottom>
              Outbreak successfully confirmed
            </Typography>
            <Typography variant="h5" gutterBottom>
              Please note this information has been moved to the outbreak section
            </Typography>
          </StyledContent>
        </DialogContent>
        <DialogActions>
          <TextButton>Stay on Alerts</TextButton>
          <Button onClick={handleClose}>Go to Outbreaks</Button>
        </DialogActions>
      </Dialog>
      <Button onClick={handleClickOpen}>Open modal</Button>
    </Container>
  );
};
