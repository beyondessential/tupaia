/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import {
  Dashboard,
  HomeButton,
  LightProfileButton,
  WarningCloud,
  TextButton,
  NavBar as BaseNavBar,
} from '@tupaia/ui-components';
import { logout } from '../store';

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

/*
 * Temporarily replacing the Profile button with a logout button. Will update the profile button in another PR
 */
// const Profile = () => <LightProfileButton startIcon={<Avatar>T</Avatar>}>Tom</LightProfileButton>;
const LogoutButton = ({ onLogout }) => <TextButton onClick={onLogout}>Logout</TextButton>;

LogoutButton.propTypes = {
  onLogout: PropTypes.func.isRequired,
};

const ConnectedLogoutButton = connect(null, dispatch => ({
  onLogout: () => dispatch(logout()),
}))(LogoutButton);

/*
 * This ensures that the link to the home page is active for sub-urls of country (eg. /weekly-reports/samoa)
 */
const HOME_ALIAS = 'weekly-reports';

/*
 * Used to determine if a router link is active
 */
const isTabActive = (match, location) => {
  if (!match) {
    return false;
  } else if (match.url === '') {
    const pathSegments = location.pathname.split('/').filter(x => x);
    return pathSegments[0] === HOME_ALIAS;
  }
  return location.pathname.indexOf(match.url) !== -1;
};

export const NavBar = () => (
  <BaseNavBar
    HomeButton={Home}
    links={links}
    Profile={ConnectedLogoutButton}
    isTabActive={isTabActive}
  />
);
