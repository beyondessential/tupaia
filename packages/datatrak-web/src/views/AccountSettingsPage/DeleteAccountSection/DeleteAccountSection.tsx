/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import { AccountSettingsSection } from '../AccountSettingsSection';
import { UserDetails } from './UserDetails';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { useUser } from '../../../api/queries';

const RequestPendingText = styled(Typography)`
  flex: 1;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

export const DeleteAccountSection = () => {
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const { data: user } = useUser();
  const { deleteAccountRequested } = user;
  const toggleConfirmationDialog = () => {
    setConfirmationDialogOpen(!confirmationDialogOpen);
  };

  return (
    <>
      <ConfirmDeleteModal open={confirmationDialogOpen} onClose={toggleConfirmationDialog} />
      <AccountSettingsSection
        title="Delete account"
        description="By requesting your account to be deleted, you will still be able to log in. You will be contacted shortly to confirm your account deletion request"
        button={{
          label: 'Request deletion',
          onClick: toggleConfirmationDialog,
          disabled: deleteAccountRequested,
          tooltip: deleteAccountRequested ? 'Request in progress' : undefined,
        }}
        centerColumn={<UserDetails user={user} />}
        rightColumn={
          user?.deleteAccountRequested ? (
            <RequestPendingText>Account deletion request pending</RequestPendingText>
          ) : null
        }
      />
    </>
  );
};
