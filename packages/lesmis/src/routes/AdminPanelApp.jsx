/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  PrivateRoute,
  ResourcePage,
  TabPageLayout,
  getFlattenedChildViews,
  PageContentWrapper,
  AUTH_ROUTES,
  AuthLayout,
  useUser,
  getHasBESAdminAccess,
} from '@tupaia/admin-panel';

import { LesmisAdminRedirect } from './LesmisAdminRedirect';
import { AdminPanelLoginPage } from '../views/AdminPanel/AdminPanelLoginPage';
import { useAdminPanelUrl, useI18n } from '../utils';
import { Footer } from '../components';
import { getRoutes } from '../views/AdminPanel/routes';
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

const AdminPanelWrapper = styled.div`
  nav a {
    font-size: 0.875rem; // make the font size smaller to fit more text in the nav and match the default font size
  }
  .MuiDrawer-paper img {
    width: 10rem; // the logo has different dimensions to the default, so override the default
  }
`;

const AdminPanelApp = () => {
  const { translate } = useI18n();
  const { data: user } = useUser();
  const adminUrl = useAdminPanelUrl();
  const hasBESAdminAccess = getHasBESAdminAccess(user);

  const routes = getRoutes(adminUrl, translate, hasBESAdminAccess);

  return (
    <AdminPanelWrapper>
      <Routes>
        <Route
          element={
            <AuthLayout
              logo={{
                url: '/lesmis-logo-white.svg',
                alt: 'LESMIS Admin Panel Logo',
              }}
              homeLink={`${adminUrl}/survey-responses`}
            />
          }
        >
          <Route path={AUTH_ROUTES.LOGIN} element={<AdminPanelLoginPage />} />
        </Route>

        <Route path="/" element={<PrivateRoute loginPath={`${adminUrl}/login`} />}>
          <Route path="/" element={<LesmisAdminRedirect />}>
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
                        <ResourcePage
                          actionLabel={translate('admin.action')}
                          {...childRoute}
                          hasBESAdminAccess={hasBESAdminAccess}
                        />
                      )
                    }
                  />
                ))}
              </Route>
            ))}
            <Route path="*" element={<Navigate to={`${adminUrl}/survey-responses`} replace />} />
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
    </AdminPanelWrapper>
  );
};

export default AdminPanelApp;
