/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import DeleteIcon from '@material-ui/icons/Delete';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { Dialog, DialogFooter, DialogHeader, DialogContent } from './Dialog';
import { ErrorOutlinedButton, WarningButton } from './Button';

const Container = styled.div`
  margin: 1rem 0 3rem;
`;

const Icon = styled(DeleteIcon)`
  font-size: 2.4rem;
  color: ${props => props.theme.palette.error.main};
  margin-bottom: 0.8rem;
`;

const Heading = styled(Typography)`
  margin-bottom: 0.8rem;
`;

export const ConfirmDeleteModal = React.memo(
  ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    description,
    cancelButtonText,
    confirmButtonText,
  }) => (
    <Dialog onClose={onCancel} open={isOpen}>
      <DialogHeader onClose={onCancel} title={title} color="error" />
      <DialogContent>
        <Container>
          <Icon />
          <Heading variant="h6">{message}</Heading>
          <Typography>{description}</Typography>
        </Container>
      </DialogContent>
      <DialogFooter>
        <ErrorOutlinedButton onClick={onCancel}>{cancelButtonText}</ErrorOutlinedButton>
        <WarningButton onClick={onConfirm}>{confirmButtonText}</WarningButton>
      </DialogFooter>
    </Dialog>
  ),
);

ConfirmDeleteModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
  title: PropTypes.string,
  message: PropTypes.string,
  description: PropTypes.string,
  cancelButtonText: PropTypes.string,
  confirmButtonText: PropTypes.string,
};

ConfirmDeleteModal.defaultProps = {
  isOpen: false,
  title: 'Delete Record',
  message: '',
  description: `Once deleted this can't be undone.`,
  cancelButtonText: 'Cancel',
  confirmButtonText: 'Yes, Delete',
};
