/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Redirect, Route, useRouteMatch } from 'react-router-dom';
import { connect } from 'react-redux';
import { Assignment, InsertChart, PeopleAlt, Storage } from '@material-ui/icons';
import { TabsToolbar } from '@tupaia/ui-components';
import {
  LogoutPage,
  PrivateRoute,
  VizBuilderApp,
  DashboardsPage,
  QuestionsPage,
  SurveysPage,
  SyncGroupsPage,
  DataElementsPage,
  DashboardItemsPage,
  DashboardRelationsPage,
  MapOverlaysPage,
  MapOverlayGroupsPage,
  MapOverlayGroupRelationsPage,
  UsersPage,
  PermissionsPage,
  EntitiesPage,
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
import { useAdminPanelUrl, useI18n } from '../utils';
import { useUser } from '../api';

const getRoutes = (adminUrl, translate) => {
  return [
    {
      label: translate('admin.surveyData'),
      to: `${adminUrl}/survey-responses`,
      icon: <Assignment />,
      tabs: [
        {
          label: translate('admin.review'),
          to: '',
          component: DraftSurveyResponsesView,
        },
        {
          label: translate('admin.approved'),
          to: '/approved',
          component: ApprovedSurveyResponsesView,
        },
        {
          label: translate('admin.rejected'),
          to: '/rejected',
          component: RejectedSurveyResponsesView,
        },
        {
          label: translate('admin.approvalNotRequired'),
          to: '/non-approval',
          component: NonApprovalSurveyResponsesView,
        },
      ],
    },
    {
      label: translate('admin.surveys'),
      to: `${adminUrl}/surveys`,
      icon: <Assignment />,
      tabs: [
        {
          label: translate('admin.surveys'),
          to: '',
          component: SurveysPage,
        },
        {
          label: translate('admin.questions'),
          to: '/questions',
          component: QuestionsPage,
        },
        {
          label: translate('admin.dataElements'),
          to: '/data-elements',
          component: DataElementsPage,
        },
        {
          label: translate('admin.syncGroups'),
          to: '/sync-groups',
          component: SyncGroupsPage,
        },
      ],
    },
    {
      label: translate('admin.visualisations'),
      to: `${adminUrl}/visualisations`,
      icon: <InsertChart />,
      tabs: [
        {
          label: translate('admin.dashboardItems'),
          to: '',
          component: props => <DashboardItemsPage {...props} vizBuilderBaseUrl={adminUrl} />,
        },
        {
          label: translate('admin.dashboards'),
          to: '/dashboards',
          component: DashboardsPage,
        },
        {
          label: translate('admin.dashboardRelations'),
          to: '/dashboard-relations',
          component: DashboardRelationsPage,
        },
        {
          label: translate('admin.mapOverlays'),
          to: '/map-overlays',
          component: props => <MapOverlaysPage {...props} vizBuilderBaseUrl={adminUrl} />,
        },
        {
          label: translate('admin.mapOverlayGroups'),
          to: '/map-overlay-groups',
          component: MapOverlayGroupsPage,
        },
        {
          label: translate('admin.mapOverlayGroupRelations'),
          to: '/map-overlay-group-relations',
          component: MapOverlayGroupRelationsPage,
        },
      ],
    },
    {
      label: `${translate('admin.users')} & ${translate('admin.permissions')}`,
      to: `${adminUrl}/users`,
      icon: <PeopleAlt />,
      tabs: [
        {
          label: translate('admin.users'),
          to: '',
          component: UsersPage,
        },
        {
          label: translate('admin.permissions'),
          to: '/permissions',
          component: PermissionsPage,
        },
      ],
    },
    {
      label: translate('admin.entities'),
      to: `${adminUrl}/entities`,
      icon: <Storage />,
      tabs: [
        {
          label: translate('admin.entities'),
          to: '',
          component: EntitiesPage,
        },
      ],
    },
  ];
};

const AdminPanelApp = ({ user }) => {
  const { translate } = useI18n();
  const headerEl = React.useRef(null);
  const { path } = useRouteMatch();
  const adminUrl = useAdminPanelUrl();
  const { isLesmisAdmin } = useUser();

  const getHeaderEl = () => {
    return headerEl;
  };

  const routes = getRoutes(adminUrl, translate);

  return (
    <Switch>
      <Route path={`${path}/login`} exact>
        <AdminPanelLoginPage />
      </Route>
      <Route path={`${path}/logout`} exact>
        <LogoutPage redirectTo={`${adminUrl}/login`} />
      </Route>
      <LesmisAdminRoute path={`${path}/viz-builder`} isLesmisAdmin={isLesmisAdmin}>
        <VizBuilderApp
          basePath={adminUrl}
          Navbar={({ user: lesmisAdminUser }) => <AdminPanelNavbar user={lesmisAdminUser} />}
        />
      </LesmisAdminRoute>
      <PrivateRoute path={`${path}`} loginPath={`${adminUrl}/login`}>
        <AdminPanelNavbar user={user} links={routes} />
        <div ref={headerEl} />
        <Switch>
          {[...routes].map(route => (
            <LesmisAdminRoute key={route.to} path={`${route.to}`} isLesmisAdmin={isLesmisAdmin}>
              <TabsToolbar links={route.tabs} maxWidth="xl" />
              <Switch>
                {route.tabs.map(tab => (
                  <Route key={`${route.to}-${tab.to}`} path={`${route.to}${tab.to}`} exact>
                    <tab.component getHeaderEl={getHeaderEl} translate={translate} />
                  </Route>
                ))}
                <Redirect to={`${route.to}`} />
              </Switch>
            </LesmisAdminRoute>
          ))}
          <Redirect to={`${path}/survey-responses`} />
        </Switch>
      </PrivateRoute>
      <Redirect to={`${path}/login`} />
    </Switch>
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
