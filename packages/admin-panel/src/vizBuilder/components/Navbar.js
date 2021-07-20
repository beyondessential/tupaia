/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import {
  HomeButton,
  NavBar as BaseNavBar,
  ProfileButton as BaseProfileButton,
  ProfileButtonItem,
} from '@tupaia/ui-components';
import MuiBox from '@material-ui/core/Box';
import { useUser } from '../api';

const ProfileButton = () => {
  const { data, isLoading } = useUser();

  if (isLoading || !data) {
    return <MuiBox height={60} />;
  }

  const user = { ...data, name: `${data.firstName} ${data.lastName}` };

  const ProfileLinks = () => (
    <>
      <ProfileButtonItem to="/profile">Edit Profile</ProfileButtonItem>
      <ProfileButtonItem to="/viz-builder">Visualisation builder</ProfileButtonItem>
      <ProfileButtonItem to="/logout">Logout</ProfileButtonItem>
    </>
  );
  return (
    <MuiBox height={60} display="flex" alignItems="center">
      <BaseProfileButton user={user} MenuOptions={ProfileLinks} />
    </MuiBox>
  );
};

export const Navbar = () => (
  <BaseNavBar
    HomeButton={<HomeButton source="/admin-panel-logo-white.svg" />}
    links={[]}
    Profile={ProfileButton}
  />
);
