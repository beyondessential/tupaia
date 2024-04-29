/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Outlet, useLocation } from 'react-router-dom';
import { labelToId } from '../utilities';
import { PrivateRoute } from '../authentication';
import { Main, PageContentWrapper, PageWrapper } from './Page';
import { NavPanel, SecondaryNavbar } from './navigation';
import { ROUTES } from '../routes';
import { Footer } from './Footer';
import { PROFILE_ROUTES } from '../profileRoutes';

export const PageLayout = ({ user }) => {
  const location = useLocation();
  const route = [...ROUTES, ...PROFILE_ROUTES].find(r => location.pathname.startsWith(r.to));

  const baseRoute = route?.to;
  return (
    <PrivateRoute>
      <PageWrapper>
        <NavPanel
          links={ROUTES.map(route => ({ ...route, id: `app-tab-${labelToId(route.label)}` }))}
          user={user}
          userLinks={[
            { label: 'Profile', to: '/profile' },
            { label: 'Logout', to: '/logout' },
          ]}
        />
        <Main>
          <PageContentWrapper>
            {route && (
              <SecondaryNavbar
                links={route?.childViews?.map(childRoute => ({
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
    </PrivateRoute>
  );
};

PageLayout.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    profileImage: PropTypes.string,
  }).isRequired,
};
