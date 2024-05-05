/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Route, Routes } from 'react-router-dom';
import { connect } from 'react-redux';
import { InsertChart, Language, PeopleAlt, Storage } from '@material-ui/icons';
import {
  LogoutPage,
  PrivateRoute,
  ResourcePage,
  TabPageLayout,
  getFlattenedChildViews,
  AppPageLayout,
  VizBuilderApp,
} from '@tupaia/admin-panel';

import { LesmisAdminRoute } from './LesmisAdminRoute';
import { AdminPanelLoginPage } from '../views/AdminPanel/AdminPanelLoginPage';
import { useAdminPanelUrl, useI18n, hasAdminPanelAccess } from '../utils';
import { Footer } from '../components';
import {
  getSurveyResponsesTabRoutes,
  getSurveysTabRoutes,
  getVisualisationsTabsRoutes,
} from '../views/AdminPanel/routes';

const getRoutes = (adminUrl, translate) => {
  return [
    getSurveyResponsesTabRoutes(translate, adminUrl),
    getSurveysTabRoutes(translate, adminUrl),
    getVisualisationsTabsRoutes(translate, adminUrl),

    {
      label: `${translate('admin.users')} & ${translate('admin.permissions')}`,
      path: '/users',
      icon: <PeopleAlt />,
      childViews: [
        // {
        //   title: translate('admin.users'),
        //   path: '',
        //   component: UsersPage,
        // },
        // {
        //   title: translate('admin.permissions'),
        //   path: '/permissions',
        //   component: PermissionsPage,
        // },
      ],
    },
    {
      label: translate('admin.entities'),
      path: '/entities',
      icon: <Storage />,
      childViews: [
        // {
        //   title: translate('admin.entities'),
        //   path: '',
        //   component: EntitiesPage,
        // },
      ],
    },
    {
      label: translate('admin.externalData'),
      path: '/external-database-connections',
      icon: <Language />,
      childViews: [
        // {
        //   title: translate('admin.externalDatabaseConnections'),
        //   path: '',
        //   component: ExternalDatabaseConnectionsPage,
        // },
      ],
    },
  ];
};

const AdminPanelApp = ({ user }) => {
  const { translate } = useI18n();
  const adminUrl = useAdminPanelUrl();
  const userHasAdminPanelAccess = hasAdminPanelAccess(user);

  const routes = getRoutes(adminUrl, translate);

  return (
    <Routes>
      <Route path="/login" element={<AdminPanelLoginPage />} />
      <Route path="/logout" element={<LogoutPage redirectTo={`${adminUrl}/login`} />} />

      <Route path="/" element={<PrivateRoute loginPath={`${adminUrl}/login`} />}>
        <Route
          path="/viz-builder/*"
          hasAdminPanelAccess={userHasAdminPanelAccess}
          element={
            <VizBuilderApp
              logo={{
                url: '/lesmis-logo-white.svg',
                alt: 'LESMIS Admin Panel Logo',
              }}
              homeLink={adminUrl}
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
              homeLink={adminUrl}
              userLinks={[{ label: 'Logout', to: '/logout' }]}
              basePath={adminUrl}
            />
          }
        >
          {routes.map(route => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <TabPageLayout routes={route.childViews} basePath={`${adminUrl}${route.path}`} />
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
                      <ResourcePage {...childRoute} />
                    )
                  }
                />
              ))}
            </Route>
            // <LesmisAdminRoute
            //   key={route.path}
            //   path={route.path}
            //   hasAdminPanelAccess={userHasAdminPanelAccess}
            //   render={({ match }) => {
            //     return (
            //       <>
            //         <SecondaryNavbar links={route.childViews} baseRoute={match.path} />
            //         <PageContentWrapper>
            //           <Switch>
            //             {route.childViews.map(tab => (
            //               <Route
            //                 key={`${route.path}-${tab.path}`}
            //                 path={`${route.path}${tab.path}`}
            //                 exact
            //               >
            //                 <tab.component translate={translate} />
            //               </Route>
            //             ))}
            //             <Redirect to={route.path} />
            //           </Switch>
            //           <Footer />
            //         </PageContentWrapper>
            //       </>
            //     );
            //   }}
            // />
          ))}
          {/* <Route path="*" element={<Navigate to={`${adminUrl}/survey-responses`} replace />} /> */}
          <Route element={<div>Hi</div>} path="*" />
        </Route>
      </Route>
      {/* <Route path="*" element={<Navigate to={`${adminUrl}/login`} />} /> */}
    </Routes>
  );
};

AdminPanelApp.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    profileImage: PropTypes.string,
  }).isRequired,
};

export default connect(
  state => ({
    user: state?.authentication?.user || {},
  }),
  null,
)(AdminPanelApp);
