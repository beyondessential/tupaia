/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ProfileButton as BaseProfileButton, ProfileButtonItem } from '@tupaia/ui-components';

export const MainMenu = () => {
  // Todo: fetch user
  const user = { name: 'Rohan Smith', email: 'rohansmith@gmail.com', firstName: 'Rohan' };
  const ProfileLinks = () => (
    <>
      <ProfileButtonItem to="/">Change Project</ProfileButtonItem>
      <ProfileButtonItem to="/">Account info</ProfileButtonItem>
      <ProfileButtonItem to="/">Help Centre</ProfileButtonItem>
      <ProfileButtonItem to="/logout">Logout</ProfileButtonItem>
    </>
  );
  return <BaseProfileButton user={user} MenuOptions={ProfileLinks} />;
};
