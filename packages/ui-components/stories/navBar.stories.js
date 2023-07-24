/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import {
  NavBar,
  ProfileButton,
  HomeButton,
  WarningCloud,
  Dashboard,
  ProfileButtonItem,
} from '../src/components';
import { RouterProvider } from '../helpers/RouterProvider';

export default {
  title: 'NavBar',
  decorators: [story => <RouterProvider>{story()}</RouterProvider>],
};

const exampleUser = {
  name: 'Catherine Bell',
  firstName: 'Catherine',
  email: 'catherine@beyondessential.com.au',
};

const ProfileLinks = () => (
  <>
    <ProfileButtonItem to="/profile">Edit Profile</ProfileButtonItem>
    <ProfileButtonItem to="/logout">Logout</ProfileButtonItem>
  </>
);

const Profile = () => <ProfileButton user={exampleUser} MenuOptions={ProfileLinks} />;

const links = [
  {
    label: 'Weekly Reports',
    to: '/',
    icon: <Dashboard />,
  },
  {
    label: 'Alerts & Outbreaks',
    to: '/alerts',
    icon: <WarningCloud />,
  },
];

const Home = () => <HomeButton source="/psss-logo-white.svg" />;

const HOME_ALIAS = 'country';

const isTabActive = (match, location) => {
  if (!match) {
    return false;
  }
  if (match.url === '') {
    const newPathnames = location.pathname.split('/').filter(x => x);
    return newPathnames[0] === HOME_ALIAS;
  }
  return location.pathname.indexOf(match.url) !== -1;
};

export const navBar = () => (
  <NavBar HomeButton={Home} Profile={Profile} links={links} isTabActive={isTabActive} />
);
