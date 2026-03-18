import React from 'react';
import { Typography } from '@material-ui/core';
import { useNavigate } from 'react-router';
import { SmallModal } from '../../components';

interface DraftExistsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNew: () => void;
  draftCount: number;
  resumePath: string;
}

export const DraftExistsModal = ({
  isOpen,
  onClose,
  onStartNew,
  draftCount,
  resumePath,
}: DraftExistsModalProps) => {
  const navigate = useNavigate();

  const message =
    draftCount > 1
      ? `You have ${draftCount} saved drafts for this survey. Would you like to continue where you left off?`
      : 'You have a saved draft for this survey. Would you like to continue where you left off?';

  return (
    <SmallModal
      open={isOpen}
      onClose={onClose}
      title="Draft in progress"
      primaryButton={{
        label: 'Continue draft',
        onClick: () => navigate(resumePath),
      }}
      secondaryButton={{
        label: 'Start new survey',
        onClick: onStartNew,
      }}
    >
      <Typography align="center">{message}</Typography>
    </SmallModal>
  );
};
