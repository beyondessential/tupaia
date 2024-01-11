/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { AccessGrantedCountryList } from './AccessGrantedCountryList.tsx';
import { AccountSettingsSection } from '../AccountSettingsSection.tsx';
import { ChangeProjectButton } from '../../../components';
import { RequestCountryAccessForm } from './RequestCountryAccessForm.tsx';

export const RequestCountryAccessSection = () => {
  const title = (
    <>
      Request country access
      <ChangeProjectButton />
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
