/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { ProfileButton as BaseProfileButton, ProfileButtonItem } from '@tupaia/ui-components';

const onLogout = () => {
  console.log('logout...');
};

const ProfileLinks = () => (
  <>
    {/* Removed for MVP @see https://github.com/beyondessential/tupaia-backlog/issues/1117*/}
    {/*<ProfileButtonItem to="/profile">Edit Profile</ProfileButtonItem>*/}
    <ProfileButtonItem button onClick={onLogout}>
      Logout
    </ProfileButtonItem>
  </>
);

const exampleUser = {
  name: 'Catherine Bell',
  firstName: 'Catherine',
  email: 'catherine@beyondessential.com.au',
};

export const ProfileButton = () => (
  <BaseProfileButton user={exampleUser} MenuOptions={ProfileLinks} />
);
