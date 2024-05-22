/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';
import { labelToId } from '../utilities';
import { Main, PageWrapper } from './Page';
import { NavPanel } from './navigation';

export const AppPageLayout = ({ routes, logo, homeLink, userLinks, basePath }) => {
  return (
    <PageWrapper>
      <NavPanel
        links={routes.map(route => ({ ...route, id: `app-tab-${labelToId(route.label)}` }))}
        userLinks={userLinks}
        logo={logo}
        homeLink={homeLink}
        basePath={basePath}
      />
      <Main>
        <Outlet />
      </Main>
    </PageWrapper>
  );
};

AppPageLayout.propTypes = {
  routes: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
    }),
  ).isRequired,
  logo: PropTypes.shape({
    url: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
  }),
  homeLink: PropTypes.string,
  userLinks: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
    }),
  ),
  basePath: PropTypes.string,
};

AppPageLayout.defaultProps = {
  logo: {
    url: '/admin-panel-logo-white.svg',
    alt: 'Tupaia Admin Panel Logo',
  },
  homeLink: '/',
  userLinks: [{ label: 'Profile', to: '/profile' }],
  basePath: '',
};
