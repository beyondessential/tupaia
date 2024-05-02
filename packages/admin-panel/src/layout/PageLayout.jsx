/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Outlet, useLocation } from 'react-router-dom';
import { labelToId } from '../utilities';
import { Main, PageContentWrapper, PageWrapper } from './Page';
import { NavPanel, SecondaryNavbar } from './navigation';
import { Footer } from './Footer';
import { PROFILE_ROUTES } from '../profileRoutes';

export const PageLayout = ({ user, routes, logo, homeLink, userLinks }) => {
  const location = useLocation();
  const activeRoute = [...routes, ...PROFILE_ROUTES].find(r => location.pathname.startsWith(r.url));

  const baseRoute = activeRoute?.url;
  return (
    <PageWrapper>
      <NavPanel
        links={routes.map(route => ({ ...route, id: `app-tab-${labelToId(route.label)}` }))}
        user={user}
        userLinks={userLinks}
        logo={logo}
        homeLink={homeLink}
      />
      <Main>
        <PageContentWrapper>
          {activeRoute && (
            <SecondaryNavbar
              // adding a key here is to force the component to re-render when the route changes. This is so that the link refs get regenerated and the scroll buttons work correctly when navigating between different routes
              key={baseRoute}
              links={activeRoute?.childViews?.map(childRoute => ({
                ...childRoute,
                id: `app-sub-view-${labelToId(childRoute.label)}`,
              }))}
              baseRoute={baseRoute}
            />
          )}
          <Outlet />

          <Footer />
        </PageContentWrapper>
      </Main>
    </PageWrapper>
  );
};

PageLayout.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    profileImage: PropTypes.string,
  }).isRequired,
  routes: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      childViews: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          url: PropTypes.string.isRequired,
          component: PropTypes.elementType.isRequired,
        }),
      ),
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
    }).isRequired,
  ),
};

PageLayout.defaultProps = {
  logo: {
    url: '/admin-panel-logo-white.svg',
    alt: 'Tupaia Admin Panel Logo',
  },
  homeLink: '/',
  userLinks: [
    {
      label: 'Profile',
      to: '/profile',
    },
    {
      label: 'Logout',
      to: '/logout',
    },
  ],
};
