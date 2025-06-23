import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import CheckCircle from '@material-ui/icons/CheckCircle';
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogFooter,
  Button,
  OutlinedButton,
} from '../src/components';

export default {
  title: 'Modal',
};

const Container = styled.div`
  padding: 1rem;
`;

export const modal = () => {
  const [open, setOpen] = useState(true);

  const handleClickOpen = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <Container>
      <Dialog onClose={handleClose} open={open}>
        <DialogHeader onClose={handleClose} title="Archive Alert" />
        <DialogContent>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </Typography>
        </DialogContent>
        <DialogFooter>
          <Button onClick={handleClose}>Confirm</Button>
        </DialogFooter>
      </Dialog>
      <Button onClick={handleClickOpen}>Open modal</Button>
    </Container>
  );
};

const TickIcon = styled(CheckCircle)`
  font-size: 2rem;
  margin-bottom: 0.3rem;
  color: ${props => props.theme.palette.success.main};
`;

export const customContent = () => {
  const [open, setOpen] = useState(true);

  const handleClickOpen = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <Container>
      <Dialog disableBackdropClick onClose={handleClose} open={open}>
        <DialogHeader onClose={handleClose} title="Confirm Outbreak" />
        <DialogContent>
          <TickIcon />
          <Typography variant="h6" gutterBottom>
            Outbreak successfully confirmed
          </Typography>
          <Typography gutterBottom>
            Please note this information has been moved to the outbreak tab.
          </Typography>
        </DialogContent>
        <DialogFooter>
          <OutlinedButton>Stay on Alerts</OutlinedButton>
          <Button onClick={handleClose}>Go to Outbreaks</Button>
        </DialogFooter>
      </Dialog>
      <Button onClick={handleClickOpen}>Open modal</Button>
    </Container>
  );
};
