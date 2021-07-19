/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import {
  HomeButton,
  NavBar as BaseNavBar,
  ProfileButton as BaseProfileButton,
  ProfileButtonItem,
} from '@tupaia/ui-components';
import { useUser } from '../api/queries';

const StyledProfileButton = styled(BaseProfileButton)`
  margin-top: 13px;
  margin-bottom: 13px;
`;

const ProfileButton = () => {
  const { data, isLoading } = useUser();

  if (isLoading) {
    return null;
  }

  const user = { ...data, name: `${data.firstName} ${data.lastName}` };

  const ProfileLinks = () => (
    <>
      <ProfileButtonItem to="/profile">Edit Profile</ProfileButtonItem>
      <ProfileButtonItem to="/viz-builder">Visualisation builder</ProfileButtonItem>
      <ProfileButtonItem
        button
        onClick={() => {
          console.log('logout ');
        }}
      >
        Logout
      </ProfileButtonItem>
    </>
  );
  return <StyledProfileButton user={user} MenuOptions={ProfileLinks} />;
};

export const Navbar = () => (
  <BaseNavBar
    HomeButton={<HomeButton source="/admin-panel-logo-white.svg" />}
    links={[]}
    Profile={ProfileButton}
  />
);
