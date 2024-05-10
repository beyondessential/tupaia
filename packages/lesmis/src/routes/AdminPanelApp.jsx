/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import styled from 'styled-components';
import {
  LogoutPage,
  PrivateRoute,
  ResourcePage,
  TabPageLayout,
  getFlattenedChildViews,
  AppPageLayout,
  VizBuilderApp,
  PageContentWrapper,
} from '@tupaia/admin-panel';

import { LesmisAdminRedirect } from './LesmisAdminRedirect';
import { AdminPanelLoginPage } from '../views/AdminPanel/AdminPanelLoginPage';
import { useAdminPanelUrl, useI18n, hasAdminPanelAccess } from '../utils';
import { Footer } from '../components';
import { getRoutes } from '../views/AdminPanel/routes';
import { getIsBESAdmin } from '../views/AdminPanel/authentication';
import { NotAuthorisedView } from '../views/NotAuthorisedView';

const PageContentContainerComponent = styled(PageContentWrapper)`
  padding-inline: 0;
  > div {
    margin-inline: 1.5rem;
  }
  footer {
    margin-block-start: 1.5rem;
  }
`;

const AdminPanelApp = ({ user, isBESAdmin }) => {
  const { translate } = useI18n();
  const location = useLocation();
  const adminUrl = useAdminPanelUrl();
  const userHasAdminPanelAccess = hasAdminPanelAccess(user);

  const routes = getRoutes(adminUrl, translate, isBESAdmin);

  return (
    <Routes>
      <Route path="/login" element={<AdminPanelLoginPage />} />
      <Route path="/logout" element={<LogoutPage redirectTo={`${adminUrl}/login`} />} />

      <Route path="/" element={<PrivateRoute loginPath={`${adminUrl}/login`} />}>
        <Route
          path="/"
          element={<LesmisAdminRedirect hasAdminPanelAccess={userHasAdminPanelAccess} />}
        >
          <Route
            path="/viz-builder/*"
            hasAdminPanelAccess={userHasAdminPanelAccess}
            element={
              <VizBuilderApp
                logo={{
                  url: '/lesmis-logo-white.svg',
                  alt: 'LESMIS Admin Panel Logo',
                }}
                homeLink={`${adminUrl}/survey-responses`}
                Footer={Footer}
              />
            }
          />
          <Route
            element={
              <AppPageLayout
                user={user}
                routes={routes}
                logo={{
                  url: '/lesmis-logo-white.svg',
                  alt: 'LESMIS Admin Panel Logo',
                }}
                homeLink={`${adminUrl}/survey-responses`}
                userLinks={[{ label: 'Logout', to: `${adminUrl}/logout` }]}
                basePath={adminUrl}
              />
            }
          >
            {routes.map(route => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <TabPageLayout
                    routes={route.childViews}
                    basePath={`${adminUrl}${route.path}`}
                    Footer={<Footer />}
                    ContainerComponent={PageContentContainerComponent}
                  />
                }
              >
                {getFlattenedChildViews(route, adminUrl).map(childRoute => (
                  <Route
                    key={childRoute.path}
                    path={childRoute.path}
                    element={
                      childRoute.Component ? (
                        <childRoute.Component />
                      ) : (
                        <ResourcePage {...childRoute} hasBESAdminAccess={isBESAdmin} />
                      )
                    }
                  />
                ))}
              </Route>
            ))}
            <Route path="*" element={<Navigate to={`${adminUrl}/survey-responses`} replace />} />
          </Route>
        </Route>
      </Route>
      <Route path="not-authorised" element={<NotAuthorisedView />} />
      <Route
        path="*"
        element={
          <Navigate
            to={`${adminUrl}/login`}
            state={{
              referrer: location.pathname,
            }}
          />
        }
      />
    </Routes>
  );
};

AdminPanelApp.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    firstName: PropTypes.string,
    profileImage: PropTypes.string,
  }),
  isBESAdmin: PropTypes.bool,
};

AdminPanelApp.defaultProps = {
  isBESAdmin: false,
  user: {},
};

export default connect(
  state => ({
    user: state?.authentication?.user || {},
    isBESAdmin: getIsBESAdmin(state),
  }),
  null,
)(AdminPanelApp);
