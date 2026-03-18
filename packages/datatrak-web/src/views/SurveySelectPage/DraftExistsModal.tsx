import React from 'react';
import { Typography } from '@material-ui/core';
import { useNavigate } from 'react-router';
import { SmallModal } from '../../components';

interface DraftExistsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNew: () => void;
  resumePath: string;
}

export const DraftExistsModal = ({
  isOpen,
  onClose,
  onStartNew,
  resumePath,
}: DraftExistsModalProps) => {
  const navigate = useNavigate();

  return (
    <SmallModal
      open={isOpen}
      onClose={onClose}
      title="This survey is existing in a draft"
      primaryButton={{
        label: 'Start new survey',
        onClick: onStartNew,
      }}
      secondaryButton={{
        label: 'Continue existing draft',
        onClick: () => navigate(resumePath),
      }}
    >
      <Typography align="center">
        This survey has a saved draft version. Would you like to start a new survey or continue the
        existing draft?
      </Typography>
    </SmallModal>
  );
};
