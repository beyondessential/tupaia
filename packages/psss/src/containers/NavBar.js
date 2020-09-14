/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Dashboard, HomeButton, WarningCloud, NavBar as BaseNavBar } from '@tupaia/ui-components';
import { ProfileButton } from '../components/ProfileButton';
import { getHomeUrl } from '../store';

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

export const NavBarComponent = ({ homeUrl }) => (
  <BaseNavBar
    HomeButton={<HomeButton homeUrl={homeUrl} source="/psss-logo-white.svg" />}
    links={links}
    Profile={ProfileButton}
    isTabActive={isTabActive}
  />
);

NavBarComponent.propTypes = {
  homeUrl: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  homeUrl: getHomeUrl(state),
});

export const NavBar = connect(mapStateToProps)(NavBarComponent);
