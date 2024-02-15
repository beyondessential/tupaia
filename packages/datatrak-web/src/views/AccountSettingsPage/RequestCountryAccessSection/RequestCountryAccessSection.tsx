/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ChangeProjectButton } from '../../../components';
import { AccountSettingsSection } from '../AccountSettingsSection';
import { AccessGrantedCountryList } from './AccessGrantedCountryList';

export const RequestCountryAccessSection = () => {
  const title = (
    <>
      Request country access <ChangeProjectButton />
    </>
  );

  const description = (
    <>
      <p>Select the countries you would like access to and the reason for requesting access</p>
      <AccessGrantedCountryList />
    </>
  );

  return <AccountSettingsSection title={title} description={description}></AccountSettingsSection>;
};
