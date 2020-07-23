/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import { NavBar, LightProfileButton, HomeButton, WarningCloud, Dashboard } from '../src';
import { RouterProvider } from '../helpers/RouterProvider';

export default {
  title: 'NavBar',
  decorators: [story => <RouterProvider>{story()}</RouterProvider>],
};

const Profile = () => <LightProfileButton startIcon={<Avatar>T</Avatar>}>Tom</LightProfileButton>;

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
  } else if (match.url === '') {
    const newPathnames = location.pathname.split('/').filter(x => x);
    return newPathnames[0] === HOME_ALIAS;
  }
  return location.pathname.indexOf(match.url) !== -1;
};

export const navBar = () => (
  <NavBar HomeButton={Home} Profile={Profile} links={links} isTabActive={isTabActive} />
);
