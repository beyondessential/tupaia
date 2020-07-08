/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push as pushToPage } from 'react-router-redux';
import { Route } from 'react-router-dom';
import Case from 'case';
import { getIsUserAuthenticated, getUserFullName, logout, LoginModal } from './authentication';
import { getActivePath } from './navigation';
import { PAGES } from './pages';
import { Navbar } from './widgets';

const LEFT_LINKS = [
  {
    label: 'Social Feed',
    path: '/social-feed',
  },
  {
    label: 'Surveys',
    path: '/surveys',
  },
  {
    label: 'Questions',
    path: '/questions',
  },
  {
    label: 'Survey Responses',
    path: '/survey-responses',
  },
  {
    label: 'Entities',
    path: '/entities',
  },
  {
    label: 'Users',
    path: '/users',
  },
  {
    label: 'Countries',
    path: '/countries',
  },
  {
    label: 'Dashboard Reports',
    path: '/dashboard-reports',
  },
  {
    label: 'Map Overlays',
    path: '/map-overlays',
  },
  {
    label: 'Dashboard Groups',
    path: '/dashboard-groups',
  },
  {
    label: 'Permissions',
    path: '/permissions',
  },
  {
    label: 'Permission Groups',
    path: '/permission-groups',
  },
  {
    label: 'Option Sets',
    path: '/option-sets',
  },
  {
    label: 'Strive',
    path: '/strive',
  },
  {
    label: 'Disasters',
    path: '/disaster',
  },
  {
    label: 'Data Sources',
    path: '/data-sources',
  },
  {
    label: 'Access Requests',
    path: '/access-requests',
  },
];

const App = props => {
  const { onClickLogout, onNavigate, isUserAuthenticated, userFullName } = props;
  const loginLink = {
    label: `Welcome ${userFullName}. Log out`,
    onClick: onClickLogout,
  };
  return (
    <div>
      <Navbar
        brandName="Tupaia Admin"
        leftLinks={LEFT_LINKS}
        rightLinks={isUserAuthenticated ? [loginLink] : []}
        onNavigate={onNavigate}
      />
      {Object.entries(PAGES).map(([pageKey, PageComponent]) => (
        <Route key={pageKey} exact path={pageKeyToPath(pageKey)} component={PageComponent} />
      ))}
      <LoginModal />
    </div>
  );
};

App.propTypes = {
  onClickLogout: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  isUserAuthenticated: PropTypes.bool.isRequired,
  userFullName: PropTypes.string,
};

App.defaultProps = {
  userFullName: '',
};

const pageKeyToPath = pageKey => `/${Case.kebab(pageKey)}`;

const mapStateToProps = state => ({
  isUserAuthenticated: getIsUserAuthenticated(state),
  userFullName: getUserFullName(state),
  activeLinkPath: getActivePath(state),
});
const mapDispatchToProps = dispatch => ({
  onClickLogout: () => dispatch(logout()),
  onNavigate: href => dispatch(pushToPage(href)),
});

export const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);
