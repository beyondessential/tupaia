/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  ErrorOutlinedButton,
  WarningButton,
  WarningCloud,
} from '@tupaia/ui-components';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';

const Container = styled.div`
  margin: 1rem 0 3rem;
`;

const Icon = styled(WarningCloud)`
  font-size: 2.4rem;
  color: ${props => props.theme.palette.error.main};
  margin-bottom: 0.8rem;
`;

const Heading = styled(Typography)`
  margin-bottom: 0.8rem;
`;

export const ConfirmDeleteModal = ({ message, onConfirm, onCancel }) => (
  <Dialog onClose={onCancel} open={!!message}>
    <DialogHeader onClose={onCancel} title="Delete Record" color="error" />
    <DialogContent>
      <Container>
        <Icon />
        <Heading variant="h6">Are you sure you want to delete this record?</Heading>
        <Typography>Once deleted this can&apos;t be undone</Typography>
      </Container>
    </DialogContent>
    <DialogFooter>
      <ErrorOutlinedButton onClick={onCancel}>Cancel</ErrorOutlinedButton>
      <WarningButton onClick={onConfirm}>Yes, Delete</WarningButton>
    </DialogFooter>
  </Dialog>
);

ConfirmDeleteModal.propTypes = {
  message: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

ConfirmDeleteModal.defaultProps = {
  message: '',
};
