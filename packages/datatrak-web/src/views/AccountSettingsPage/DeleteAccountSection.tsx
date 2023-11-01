/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { AccountSettingsSection } from './AccountSettingsSection';
import { useUser } from '../../api/queries';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';

const UserContent = styled.div``;

const UserName = styled(Typography)`
  font-weight: 500;
`;

export const DeleteAccountSection = () => {
  const { data: user } = useUser();
  return (
    <AccountSettingsSection
      title="Delete account"
      description="By requesting your account to be deleted, you will still be able to log in. You will be contacted shortly to confirm your account deletion request"
      button={{
        label: 'Request deletion',
        onClick: () => {},
      }}
      centerColumn={
        <UserContent>
          <UserName>{user?.userName}</UserName>
          <Typography>{user?.email}</Typography>
        </UserContent>
      }
    />
  );
};
