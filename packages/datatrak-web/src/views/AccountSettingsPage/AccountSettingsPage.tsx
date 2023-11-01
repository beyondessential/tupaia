/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { Settings } from '@material-ui/icons';
import { PersonalDetailsSection } from './PersonalDetailsSection';
import { ChangePasswordSection } from './ChangePasswordSection';
import { RequestCountryAccessSection } from './RequestCountryAccessSection';
import { DeleteAccountSection } from './DeleteAccountSection';

const Wrapper = styled.div`
  padding: 1.2rem 2.8rem 2.3rem;
`;

const PageTitle = styled(Typography).attrs({
  variant: 'h1',
})`
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  .MuiSvgIcon-root {
    margin-right: 0.5rem;
  }
`;

export const AccountSettingsPage = () => {
  return (
    <Wrapper>
      <PageTitle>
        <Settings color="primary" />
        Account Settings
      </PageTitle>
      <PersonalDetailsSection />
      <ChangePasswordSection />
      <RequestCountryAccessSection />
      <DeleteAccountSection />
    </Wrapper>
  );
};
