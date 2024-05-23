/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Route, Routes, Navigate } from 'react-router-dom';
import { connect } from 'react-redux';
import styled from 'styled-components';
import {
  PrivateRoute,
  ResourcePage,
  TabPageLayout,
  getFlattenedChildViews,
  AppPageLayout,
  VizBuilderApp,
  PageContentWrapper,
  AUTH_ROUTES,
  AuthLayout,
} from '@tupaia/admin-panel';

import { LesmisAdminRedirect } from './LesmisAdminRedirect';
import { AdminPanelLoginPage } from '../views/AdminPanel/AdminPanelLoginPage';
import { useAdminPanelUrl, useI18n } from '../utils';
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

const AdminPanelApp = ({ isBESAdmin }) => {
  const { translate } = useI18n();
  const adminUrl = useAdminPanelUrl();

  const routes = getRoutes(adminUrl, translate, isBESAdmin);

  return (
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

      <Route path="/" element={<PrivateRoute basePath={adminUrl} />}>
        <Route path="/" element={<LesmisAdminRedirect />}>
          <Route
            path="/viz-builder/*"
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
                routes={routes}
                logo={{
                  url: '/lesmis-logo-white.svg',
                  alt: 'LESMIS Admin Panel Logo',
                }}
                homeLink={`${adminUrl}/survey-responses`}
                userLinks={[]}
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
          </Route>
          <Route index element={<Navigate to={`${adminUrl}/survey-responses`} replace />} />
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
