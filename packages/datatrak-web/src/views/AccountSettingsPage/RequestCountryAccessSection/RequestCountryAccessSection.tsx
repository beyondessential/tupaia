/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { AccessGrantedCountryList } from './AccessGrantedCountryList.tsx';
import { AccountSettingsSection } from '../AccountSettingsSection.tsx';
import { ChangeProjectButton } from '../../../components';
import { RequestCountryAccessForm } from './RequestCountryAccessForm.tsx';

const StyledProjectButton = styled(ChangeProjectButton)`
  :before {
    color: ${({ theme }) => theme.palette.text.secondary};
    content: '|';
    margin-inline: 0.25rem;
  }
`;

export const RequestCountryAccessSection = () => {
  const title = (
    <>
      Request country access
      <StyledProjectButton />
    </>
  );

  const description = (
    <>
      <p>Select the countries you would like access to and the reason for requesting access</p>
      <AccessGrantedCountryList />
    </>
  );

  return (
    <AccountSettingsSection title={title} description={description}>
      <RequestCountryAccessForm />
    </AccountSettingsSection>
  );
};
