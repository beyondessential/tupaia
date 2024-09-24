/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Typography } from '@material-ui/core';
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
      <Typography color="textSecondary">
        Select the countries you would like access to and the reason for requesting access
      </Typography>
      <AccessGrantedCountryList countryAccessList={countryAccessList} />
    </>
  );

  return (
    <AccountSettingsSection title={title} DescriptionComponent={description}>
      <RequestCountryAccessForm countryAccessList={countryAccessList} project={project} />
    </AccountSettingsSection>
  );
};
