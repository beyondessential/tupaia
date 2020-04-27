/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import { HomeButton } from '../components/HomeButton';
import { NavBar } from '../components/NavBar';
import { LightProfileButton } from '../components/ProfileButton';
import { WarningCloud, Dashboard } from '../components/Icons';
import { RouterProvider } from '../RouterProvider';

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

const isActive = (match, location) => {
  if (!match) {
    return false;
  } else if (match.url === '') {
    const newPathnames = location.pathname.split('/').filter(x => x);
    return newPathnames[0] === HOME_ALIAS;
  }
  return location.pathname.indexOf(match.url) !== -1;
};

export const navBar = () => (
  <NavBar HomeButton={Home} Profile={Profile} links={links} isActive={isActive} />
);
