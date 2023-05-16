/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React, { FC, ReactElement } from 'react';
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

export const ConfirmDeleteModal: FC<{
  isOpen?: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  description?: string;
  cancelButtonText?: string;
  confirmButtonText?: string;
}> = React.memo(
  ({
    isOpen = false,
    title = 'Delete Record',
    message = '',
    onConfirm,
    onCancel,
    description = `Once deleted this can't be undone.`,
    cancelButtonText = 'Cancel',
    confirmButtonText = 'Yes, Delete',
  }): ReactElement => (
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
