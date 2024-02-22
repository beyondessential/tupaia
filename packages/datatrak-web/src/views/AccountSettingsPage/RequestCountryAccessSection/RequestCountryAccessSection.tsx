/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ChangeProjectButton } from '../../../components';
import { AccountSettingsSection } from '../AccountSettingsSection';
import { AccessGrantedCountryList } from './AccessGrantedCountryList';
import { RequestCountryAccessForm } from './RequestCountryAccessForm';
import { useCountryAccessList, useCurrentUser } from '../../../api';

/**
 * @privateRemarks TODO: Import this from @tupaia/tsutils.
 *
 * This is more or less replicated from `typeGuards.ts` in tsutils, because importing it here seems
 * to indirectly cause DataTrak to crash on remote deployments.
 *
 * @see https://beyondessential.slack.com/archives/C032DCHKTGR/p1708553985766539?thread_ts=1707443585.079349&cid=C032DCHKTGR
 */
function assertIsNotNullish<T>(val: T): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new Error(`Expected project to be defined, but got ${val}`);
  }
}

export const RequestCountryAccessSection = () => {
  const { project } = useCurrentUser();

  // If `RequestCountryAccessForm` is being rendered, the user should already have a project
  // selected. Otherwise, they should’ve been redirected to select a project by now.
  assertIsNotNullish(project);

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
