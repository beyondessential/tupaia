import React from 'react';

import { ChangeProjectButton } from '../../../components';
import { AccountSettingsSection } from '../AccountSettingsSection';
import { AccessGrantedCountryList } from './AccessGrantedCountryList';
import { RequestCountryAccessForm } from './RequestCountryAccessForm';

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
    <AccountSettingsSection heading={title} description={description}>
      <RequestCountryAccessForm />
    </AccountSettingsSection>
  );
};
