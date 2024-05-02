/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Route, useMatch, Outlet, Routes } from 'react-router-dom';
import { connect } from 'react-redux';
import { Assignment, InsertChart, Language, PeopleAlt, Storage } from '@material-ui/icons';
import {
  LogoutPage,
  PrivateRoute,
  VizBuilderApp,
  TabRoutes,
  PageWrapper,
  Main,
} from '@tupaia/admin-panel';

import { LesmisAdminRoute } from './LesmisAdminRoute';
import {
  ApprovedSurveyResponsesView,
  DraftSurveyResponsesView,
  RejectedSurveyResponsesView,
  NonApprovalSurveyResponsesView,
} from '../views/AdminPanel/SurveyResponsesView';
import { AdminPanelNavbar } from '../views/AdminPanel/AdminPanelNavBar';
import { AdminPanelLoginPage } from '../views/AdminPanel/AdminPanelLoginPage';
import { useAdminPanelUrl, useI18n, hasAdminPanelAccess } from '../utils';
import { Footer } from '../components';

const getRoutes = (adminUrl, translate) => {
  return [
    {
      title: translate('admin.surveyData'),
      url: `${adminUrl}/survey-responses`,
      icon: <Assignment />,
      childViews: [
        {
          title: translate('admin.review'),
          url: '',
          Component: DraftSurveyResponsesView,
        },
        {
          title: translate('admin.approved'),
          url: '/approved',
          Component: ApprovedSurveyResponsesView,
        },
        {
          title: translate('admin.rejected'),
          url: '/rejected',
          Component: RejectedSurveyResponsesView,
        },
        {
          title: translate('admin.approvalNotRequired'),
          url: '/non-approval',
          Component: NonApprovalSurveyResponsesView,
        },
      ],
    },
    // {
    //   title: translate('admin.surveys'),
    //   url: `${adminUrl}/surveys`,
    //   icon: <Assignment />,
    //   tabs: [
    //     {
    //       title: translate('admin.surveys'),
    //       url: '',
    //       component: SurveysPage,
    //     },
    //     {
    //       title: translate('admin.questions'),
    //       url: '/questions',
    //       component: QuestionsPage,
    //     },
    //     {
    //       title: translate('admin.dataElements'),
    //       url: '/data-elements',
    //       component: DataElementsPage,
    //     },
    //     {
    //       title: translate('admin.syncGroups'),
    //       url: '/sync-groups',
    //       component: SyncGroupsPage,
    //     },
    //   ],
    // },
    // {
    //   title: translate('admin.visualisations'),
    //   url: `${adminUrl}/visualisations`,
    //   icon: <InsertChart />,
    //   tabs: [
    //     {
    //       title: translate('admin.dashboardItems'),
    //       url: '',
    //       component: props => <DashboardItemsPage {...props} vizBuilderBaseUrl={adminUrl} />,
    //     },
    //     {
    //       title: translate('admin.dashboards'),
    //       url: '/dashboards',
    //       component: DashboardsPage,
    //     },
    //     {
    //       title: translate('admin.dashboardRelations'),
    //       url: '/dashboard-relations',
    //       component: DashboardRelationsPage,
    //     },
    //     {
    //       title: translate('admin.mapOverlays'),
    //       url: '/map-overlays',
    //       component: props => <MapOverlaysPage {...props} vizBuilderBaseUrl={adminUrl} />,
    //     },
    //     {
    //       title: translate('admin.mapOverlayGroups'),
    //       url: '/map-overlay-groups',
    //       component: MapOverlayGroupsPage,
    //     },
    //     {
    //       title: translate('admin.mapOverlayGroupRelations'),
    //       url: '/map-overlay-group-relations',
    //       component: MapOverlayGroupRelationsPage,
    //     },
    //     {
    //       title: translate('admin.dataTables'),
    //       url: '/dataTables',
    //       component: DataTablesPage,
    //     },
    //   ],
    // },
    // {
    //   title: `${translate('admin.users')} & ${translate('admin.permissions')}`,
    //   url: `${adminUrl}/users`,
    //   icon: <PeopleAlt />,
    //   tabs: [
    //     {
    //       title: translate('admin.users'),
    //       url: '',
    //       component: UsersPage,
    //     },
    //     {
    //       title: translate('admin.permissions'),
    //       url: '/permissions',
    //       component: PermissionsPage,
    //     },
    //   ],
    // },
    // {
    //   title: translate('admin.entities'),
    //   url: `${adminUrl}/entities`,
    //   icon: <Storage />,
    //   tabs: [
    //     {
    //       title: translate('admin.entities'),
    //       url: '',
    //       component: EntitiesPage,
    //     },
    //   ],
    // },
    // {
    //   title: translate('admin.externalData'),
    //   url: `${adminUrl}/external-database-connections`,
    //   icon: <Language />,
    //   tabs: [
    //     {
    //       title: translate('admin.externalDatabaseConnections'),
    //       url: '',
    //       component: ExternalDatabaseConnectionsPage,
    //     },
    //   ],
    // },
  ];
};

const PageLayout = ({ user, routes }) => {
  return (
    <PageWrapper>
      <AdminPanelNavbar user={user} links={routes} />
      <Main>
        <Outlet />
      </Main>
    </PageWrapper>
  );
};

const AdminPanelApp = ({ user }) => {
  const { translate } = useI18n();
  const { path } = useMatch();
  const adminUrl = useAdminPanelUrl();
  const userHasAdminPanelAccess = hasAdminPanelAccess(user);

  const routes = getRoutes(adminUrl, translate);

  return (
    <Routes>
      <Route path={`${path}/login`} exact element={<AdminPanelLoginPage />} />
      <Route
        path={`${path}/logout`}
        exact
        element={<LogoutPage redirectTo={`${adminUrl}/login`} />}
      />

      <LesmisAdminRoute
        path={`${path}/viz-builder`}
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
      <Route path={`${path}`} element={<PrivateRoute loginPath={`${adminUrl}/login`} />}>
        <Route element={<PageLayout user={user} routes={routes} />}>
          {routes.map(route => (
            <Route key={route.url} path={`${route.url}/*`} element={<TabRoutes route={route} />} />
            // <LesmisAdminRoute
            //   key={route.url}
            //   path={route.url}
            //   hasAdminPanelAccess={userHasAdminPanelAccess}
            //   render={({ match }) => {
            //     return (
            //       <>
            //         <SecondaryNavbar links={route.tabs} baseRoute={match.url} />
            //         <PageContentWrapper>
            //           <Switch>
            //             {route.tabs.map(tab => (
            //               <Route
            //                 key={`${route.url}-${tab.url}`}
            //                 path={`${route.url}${tab.url}`}
            //                 exact
            //               >
            //                 <tab.component translate={translate} />
            //               </Route>
            //             ))}
            //             <Redirect to={route.url} />
            //           </Switch>
            //           <Footer />
            //         </PageContentWrapper>
            //       </>
            //     );
            //   }}
            // />
          ))}
          {/* <Redirect to={`${path}/survey-responses`} /> */}
        </Route>
      </Route>
      {/* <Redirect to={`${path}/login`} /> */}
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
