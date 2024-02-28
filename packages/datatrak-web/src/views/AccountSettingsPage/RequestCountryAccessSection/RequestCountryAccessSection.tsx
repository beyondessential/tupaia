/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ChangeProjectButton } from '../../../components';
import { AccountSettingsSection } from '../AccountSettingsSection';
import { useCountryAccessList, useCurrentUser } from '../../../api';
import { AccessGrantedCountryList } from './AccessGrantedCountryList';
import { RequestCountryAccessForm } from './RequestCountryAccessForm';

export const RequestCountryAccessSection = () => {
  const { project } = useCurrentUser();
  const countryAccessList = useCountryAccessList();

  const title = (
    <>
      Request country access
      <ChangeProjectButton />
    </>
  );

  const description = (
    <>
      <p>Select the countries you would like access to and the reason for requesting access</p>
      <AccessGrantedCountryList countryAccessList={countryAccessList} project={project} />
    </>
  );

  return (
    <AccountSettingsSection title={title} description={description}>
      <RequestCountryAccessForm countryAccessList={countryAccessList} project={project} />
    </AccountSettingsSection>
  );
};
