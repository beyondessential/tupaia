import React from 'react';
import { Typography } from '@material-ui/core';
import { SmallModal } from '../../../components';

interface SaveAndExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  isLoading: boolean;
}

export const SaveAndExitModal = ({
  isOpen,
  onClose,
  onSave,
  isLoading,
}: SaveAndExitModalProps) => {
  return (
    <SmallModal
      open={isOpen}
      onClose={onClose}
      title="Save & exit"
      primaryButton={{
        label: 'Save and exit',
        onClick: onSave,
      }}
      secondaryButton={{
        label: 'Cancel',
        onClick: onClose,
      }}
      isLoading={isLoading}
    >
      <Typography align="center">
        You can continue completing this survey at anytime by accessing it on the dashboard
      </Typography>
    </SmallModal>
  );
};
