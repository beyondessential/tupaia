/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Dashboard, HomeButton, WarningCloud, NavBar as BaseNavBar } from '@tupaia/ui-components';
import { ProfileButton } from './ProfileButton';
import { getCountryCodes, getHomeUrl, checkIsMultiCountryUser } from '../store';

const constructIsActive = tabDirectories => (_, location) =>
  tabDirectories.some(dir => location.pathname.split('/')[1] === dir);

export const NavBarComponent = ({ homeUrl, links }) => (
  <BaseNavBar
    HomeButton={<HomeButton homeUrl={homeUrl} source="/psss-logo-white.svg" />}
    links={links}
    Profile={ProfileButton}
  />
);

NavBarComponent.propTypes = {
  homeUrl: PropTypes.string.isRequired,
  links: PropTypes.arrayOf(PropTypes.shape({})),
};

NavBarComponent.defaultProps = {
  links: [],
};

const makeLinks = state => {
  const countryCodes = getCountryCodes(state);
  const multiCountry = checkIsMultiCountryUser(state);
  return [
    {
      label: 'Weekly Reports',
      to: multiCountry ? '/' : `/weekly-reports/${countryCodes[0]}`,
      isActive: constructIsActive(['', 'weekly-reports']),
      icon: <Dashboard />,
    },
    {
      label: 'Alerts & Outbreaks',
      to: multiCountry ? '/alerts/active' : `/alerts/active/${countryCodes[0]}`,
      isActive: constructIsActive(['alerts']),
      icon: <WarningCloud />,
    },
  ];
};

const mapStateToProps = state => ({
  homeUrl: getHomeUrl(state),
  links: makeLinks(state),
});

export const NavBar = connect(mapStateToProps)(NavBarComponent);
