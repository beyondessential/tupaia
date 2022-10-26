/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useUser } from '../api/queries';
import { ProfileButton as BaseProfileButton, ProfileButtonItem } from '@tupaia/ui-components';

export const MainMenu = () => {
  const { data, isSuccess } = useUser();

  const ProfileLinks = () => (
    <>
      <ProfileButtonItem to="/">Change Project</ProfileButtonItem>
      <ProfileButtonItem to="/">Account info</ProfileButtonItem>
      <ProfileButtonItem to="/">Help Centre</ProfileButtonItem>
      <ProfileButtonItem to="/logout">Logout</ProfileButtonItem>
    </>
  );
  return isSuccess ? (
    <BaseProfileButton
      user={{
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        firstName: data.firstName,
        profileImage: data.profileImage,
      }}
      MenuOptions={ProfileLinks}
    />
  ) : null;
};
