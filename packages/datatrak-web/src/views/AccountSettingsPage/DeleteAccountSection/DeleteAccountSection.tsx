import React, { useState } from 'react';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import { AccountSettingsSection } from '../AccountSettingsSection';
import { UserDetails } from './UserDetails';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { useCurrentUserContext } from '../../../api';
import { AccountSettingsColumn } from '../AccountSettingsColumn';
import { Button } from '../../../components';

const RequestPendingText = styled(Typography)`
  flex: 1;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

export const DeleteAccountSection = () => {
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const { deleteAccountRequested } = useCurrentUserContext();
  const toggleConfirmationDialog = () => {
    setConfirmationDialogOpen(!confirmationDialogOpen);
  };

  return (
    <>
      <ConfirmDeleteModal open={confirmationDialogOpen} onClose={toggleConfirmationDialog} />
      <AccountSettingsSection
        heading="Delete account"
        description={
          <Typography color="textSecondary">
            By requesting your account to be deleted, you will still be able to log in. You will be
            contacted shortly to confirm your account deletion request
          </Typography>
        }
      >
        <AccountSettingsColumn>
          <UserDetails />
        </AccountSettingsColumn>
        <AccountSettingsColumn>
          {deleteAccountRequested ? (
            <RequestPendingText>Account deletion request pending</RequestPendingText>
          ) : null}
          <Button
            tooltip={deleteAccountRequested ? 'Request in progress' : undefined}
            disabled={deleteAccountRequested}
            onClick={toggleConfirmationDialog}
          >
            Request deletion
          </Button>
        </AccountSettingsColumn>
      </AccountSettingsSection>
    </>
  );
};
