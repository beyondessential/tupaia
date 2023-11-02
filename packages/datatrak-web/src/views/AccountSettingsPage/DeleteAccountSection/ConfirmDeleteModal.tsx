/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Typography } from '@material-ui/core';
import { SmallModal } from '../../../components';
import { useRequestDeleteAccount } from '../../../api/mutations';
import { SpinningLoader } from '@tupaia/ui-components';

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
}

export const ConfirmDeleteModal = ({ open, onClose }: ConfirmDeleteModalProps) => {
  const { mutate: requestAccountDeletion, isLoading } = useRequestDeleteAccount(onClose);

  return (
    <SmallModal
      open={open}
      onClose={onClose}
      title="Are you sure you want to request the deletion of your account?"
      primaryButton={
        isLoading
          ? undefined
          : {
              label: 'Request deletion',
              onClick: requestAccountDeletion as () => void,
            }
      }
      secondaryButton={isLoading ? undefined : { label: 'Cancel', onClick: onClose }}
    >
      {isLoading ? (
        <SpinningLoader />
      ) : (
        <Typography align="center">This action is irreversible</Typography>
      )}
    </SmallModal>
  );
};
