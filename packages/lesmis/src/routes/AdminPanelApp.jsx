/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Route, useMatch, Outlet, Routes, Navigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { Assignment, InsertChart, Language, PeopleAlt, Storage } from '@material-ui/icons';
import {
  LogoutPage,
  PrivateRoute,
  ResourcePage,
  TabPageLayout,
  getFlattenedChildViews,
  AppPageLayout,
} from '@tupaia/admin-panel';

import { LesmisAdminRoute } from './LesmisAdminRoute';
import {
  ApprovedSurveyResponsesView,
  RejectedSurveyResponsesView,
  NonApprovalSurveyResponsesView,
  draftSurveyResponses,
} from '../views/AdminPanel/SurveyResponsesView';
import { AdminPanelNavbar } from '../views/AdminPanel/AdminPanelNavBar';
import { AdminPanelLoginPage } from '../views/AdminPanel/AdminPanelLoginPage';
import { useAdminPanelUrl, useI18n, hasAdminPanelAccess } from '../utils';
import { Footer } from '../components';

const getRoutes = (adminUrl, translate) => {
  return [
    {
      label: translate('admin.surveyData'),
      path: '/survey-responses',
      icon: <Assignment />,
      childViews: [
        draftSurveyResponses(translate),
        // {
        //   title: translate('admin.review'),
        //   path: '',
        //   Component: DraftSurveyResponsesView,
        // },
        // {
        //   title: translate('admin.approved'),
        //   path: '/approved',
        //   Component: ApprovedSurveyResponsesView,
        // },
        // {
        //   title: translate('admin.rejected'),
        //   path: '/rejected',
        //   Component: RejectedSurveyResponsesView,
        // },
        // {
        //   title: translate('admin.approvalNotRequired'),
        //   path: '/non-approval',
        //   Component: NonApprovalSurveyResponsesView,
        // },
      ],
    },
    {
      label: translate('admin.surveys'),
      path: '/surveys',
      icon: <Assignment />,
      childViews: [
        // {
        //   title: translate('admin.surveys'),
        //   path: '',
        //   component: SurveysPage,
        // },
        // {
        //   title: translate('admin.questions'),
        //   path: '/questions',
        //   component: QuestionsPage,
        // },
        // {
        //   title: translate('admin.dataElements'),
        //   path: '/data-elements',
        //   component: DataElementsPage,
        // },
        // {
        //   title: translate('admin.syncGroups'),
        //   path: '/sync-groups',
        //   component: SyncGroupsPage,
        // },
      ],
    },
    {
      label: translate('admin.visualisations'),
      path: '/visualisations',
      icon: <InsertChart />,
      childViews: [
        // {
        //   title: translate('admin.dashboardItems'),
        //   path: '',
        //   component: props => <DashboardItemsPage {...props} vizBuilderBaseUrl={adminUrl} />,
        // },
        // {
        //   title: translate('admin.dashboards'),
        //   path: '/dashboards',
        //   component: DashboardsPage,
        // },
        // {
        //   title: translate('admin.dashboardRelations'),
        //   path: '/dashboard-relations',
        //   component: DashboardRelationsPage,
        // },
        // {
        //   title: translate('admin.mapOverlays'),
        //   path: '/map-overlays',
        //   component: props => <MapOverlaysPage {...props} vizBuilderBaseUrl={adminUrl} />,
        // },
        // {
        //   title: translate('admin.mapOverlayGroups'),
        //   path: '/map-overlay-groups',
        //   component: MapOverlayGroupsPage,
        // },
        // {
        //   title: translate('admin.mapOverlayGroupRelations'),
        //   path: '/map-overlay-group-relations',
        //   component: MapOverlayGroupRelationsPage,
        // },
        // {
        //   title: translate('admin.dataTables'),
        //   path: '/dataTables',
        //   component: DataTablesPage,
        // },
      ],
    },
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
  console.log(routes);
  return (
    <Routes>
      <Route path="/login" element={<AdminPanelLoginPage />} />
      <Route path="/logout" element={<LogoutPage redirectTo={`${adminUrl}/login`} />} />

      {/* <LesmisAdminRoute
        path={`${path}/viz-builder`}
        hasAdminPanelAccess={userHasAdminPanelAccess}
        element={
          <VizBuilderApp
            logo={{
              path: '/lesmis-logo-white.svg',
              alt: 'LESMIS Admin Panel Logo',
            }}
            homeLink={adminUrl}
            Footer={Footer}
          />
        }
      /> */}
      <Route path="/" element={<PrivateRoute loginPath={`${adminUrl}/login`} />}>
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
              {getFlattenedChildViews(route).map(childRoute => (
                <Route
                  key={childRoute.title}
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
