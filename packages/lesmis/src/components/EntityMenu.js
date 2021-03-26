/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import MuiButton from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import { DialogHeader } from './FullScreenDialog';

const TextButton = styled(MuiButton)`
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1rem;
  letter-spacing: 0;
  color: ${props => props.theme.palette.text.secondary};
  padding: 0.375rem 1.18rem 0.372rem 0.625rem;
`;

const Body = styled.div`
  background: ${props => props.theme.palette.grey['100']};
  height: 100%;
  padding: 1.8rem;
`;

export const EntityMenu = ({ buttonText }) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <TextButton onClick={handleClickOpen}>{buttonText}</TextButton>
      <Dialog fullScreen open={open} onClose={handleClose}>
        <DialogHeader handleClose={handleClose} title="All Locations" />
        <Body>
          <Typography>Entity Menu</Typography>
        </Body>
      </Dialog>
    </>
  );
};

EntityMenu.propTypes = {
  buttonText: PropTypes.string.isRequired,
};
