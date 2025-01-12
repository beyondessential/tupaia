import React from 'react';
import { useCountryAccessList, useCurrentUserContext } from '../../../api';
import { ChangeProjectButton } from '../../../components';
import { AccountSettingsSection } from '../AccountSettingsSection';
import { AccessGrantedCountryList } from './AccessGrantedCountryList';
import { RequestCountryAccessForm } from './RequestCountryAccessForm';

export const RequestCountryAccessSection = () => {
  const { project } = useCurrentUserContext();
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
