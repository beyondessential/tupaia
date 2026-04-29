import React from 'react';
import { Typography } from '@material-ui/core';
import { SmallModal } from '../../../components';

interface DraftExistsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNew: () => void;
  onResume: () => void;
}

export const DraftExistsModal = ({
  isOpen,
  onClose,
  onStartNew,
  onResume,
}: DraftExistsModalProps) => {
  return (
    <SmallModal
      open={isOpen}
      onClose={onClose}
      title="This survey is existing in a draft"
      width="28rem"
      disablePortal={false}
      primaryButton={{
        label: 'Start new survey',
        onClick: onStartNew,
      }}
      secondaryButton={{
        label: 'Continue existing draft',
        onClick: onResume,
      }}
    >
      <Typography align="center">
        This survey has a saved draft version. Would you like to start a new survey or continue the
        existing draft?
      </Typography>
    </SmallModal>
  );
};
