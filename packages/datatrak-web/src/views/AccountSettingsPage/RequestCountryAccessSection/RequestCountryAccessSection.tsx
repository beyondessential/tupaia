/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useCurrentUser, useCountryAccessList } from '../../../api';
import { ChangeProjectButton } from '../../../components';
import { AccountSettingsSection } from '../AccountSettingsSection';
import { AccessGrantedCountryList } from './AccessGrantedCountryList';
import { RequestCountryAccessForm } from './RequestCountryAccessForm';

export const RequestCountryAccessSection = () => {
  const { project } = useCurrentUser();
  const countryAccessList = useCountryAccessList(project?.code ?? '');

  const title = (
    <>
      Request country access
      <ChangeProjectButton />
    </>
  );

  const description = (
    <>
      <p>Select the countries you would like access to and the reason for requesting access</p>
      <AccessGrantedCountryList countryAccessList={countryAccessList} />
    </>
  );

  return (
    <AccountSettingsSection title={title} description={description}>
      <RequestCountryAccessForm countryAccessList={countryAccessList} project={project} />
    </AccountSettingsSection>
  );
};
