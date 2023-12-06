/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { AccountSettingsSection } from '../AccountSettingsSection.tsx';
import { RequestCountryAccessForm } from './RequestCountryAccessForm.tsx';

export const RequestCountryAccessSection = () => {
  return (
    <AccountSettingsSection
      title="Request country access"
      description="Select the countries you would like access to and the reason for requesting access"
    >
      <RequestCountryAccessForm />
    </AccountSettingsSection>
  );
};
