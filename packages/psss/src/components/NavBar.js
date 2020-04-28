/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import {
  Dashboard,
  HomeButton,
  LightProfileButton,
  WarningCloud,
  NavBar as BaseNavBar,
} from '@tupaia/ui-components';
import Avatar from '@material-ui/core/Avatar';

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

const Profile = () => <LightProfileButton startIcon={<Avatar>T</Avatar>}>Tom</LightProfileButton>;

/*
 * This ensures that the link to the home page is active for sub-urls of country (eg. /weekly-reports/samoa)
 */
export const HOME_ALIAS = 'weekly-reports';

/*
 * Used to determine if a router link is active
 */
const isActive = (match, location) => {
  if (!match) {
    return false;
  } else if (match.url === '') {
    const pathSegments = location.pathname.split('/').filter(x => x);
    return pathSegments[0] === HOME_ALIAS;
  }
  return location.pathname.indexOf(match.url) !== -1;
};

export const NavBar = () => (
  <BaseNavBar HomeButton={Home} links={links} Profile={Profile} isActive={isActive} />
);
