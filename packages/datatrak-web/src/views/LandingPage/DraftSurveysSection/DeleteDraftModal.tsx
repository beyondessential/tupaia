import React from 'react';
import { Typography } from '@material-ui/core';
import { SmallModal } from '../../../components';

interface DeleteDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  isLoading: boolean;
}

export const DeleteDraftModal = ({
  isOpen,
  onClose,
  onDelete,
  isLoading,
}: DeleteDraftModalProps) => {
  if (!isOpen) return null;

  return (
    <SmallModal
      open
      onClose={onClose}
      title="Delete draft"
      primaryButton={{
        label: 'Delete draft',
        onClick: onDelete,
      }}
      secondaryButton={{
        label: 'Cancel',
        onClick: onClose,
      }}
      isLoading={isLoading}
    >
      <Typography align="center">
        Are you sure you would like to delete this saved draft?
      </Typography>
    </SmallModal>
  );
};
