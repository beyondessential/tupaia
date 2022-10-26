/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useLogout } from '../api/mutations';
import { ProfileButton as BaseProfileButton, ProfileButtonItem } from '@tupaia/ui-components';
import { useHistory } from 'react-router-dom';

export const MainMenu = ({ user }) => {
  const { mutate: logout } = useLogout();
  const { push } = useHistory();

  console.log('user', user);

  const onClickLogout = async () => {
    console.log('logout');
    await logout();
    push('/');
  };

  const ProfileLinks = () => (
    <>
      <ProfileButtonItem to="/">Change Project</ProfileButtonItem>
      <ProfileButtonItem to="/">Account info</ProfileButtonItem>
      <ProfileButtonItem to="/">Help Centre</ProfileButtonItem>
      <ProfileButtonItem onClick={onClickLogout}>Logout</ProfileButtonItem>
    </>
  );

  return user ? (
    <BaseProfileButton
      user={{
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        firstName: user.firstName,
        profileImage: user.profileImage,
      }}
      MenuOptions={ProfileLinks}
    />
  ) : null;
};
