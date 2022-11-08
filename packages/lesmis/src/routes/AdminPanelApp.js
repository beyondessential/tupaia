/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Redirect, Route, useRouteMatch } from 'react-router-dom';
import { connect } from 'react-redux';
import { Assignment, InsertChart, PeopleAlt } from '@material-ui/icons';
import { TabsToolbar } from '@tupaia/ui-components';
import {
  DashboardsPage,
  QuestionsPage,
  SurveysPage,
  DataElementsPage,
  DashboardItemsPage,
  DashboardRelationsPage,
  MapOverlayGroupRelationsPage,
  MapOverlayGroupsPage,
  MapOverlaysPage,
  UsersPage,
  LogoutPage,
  PrivateRoute,
  VizBuilderProviders,
  VizBuilderApp,
} from '@tupaia/admin-panel';
import { LesmisAdminRoute } from './LesmisAdminRoute';
import { PermissionsView } from '../views/AdminPanel/PermissionsView';
import {
  ApprovedSurveyResponsesView,
  DraftSurveyResponsesView,
  RejectedSurveyResponsesView,
  NonApprovalSurveyResponsesView,
} from '../views/AdminPanel/SurveyResponsesView';
import { AdminPanelNavbar } from '../views/AdminPanel/AdminPanelNavBar';
import { AdminPanelLoginPage } from '../views/AdminPanel/AdminPanelLoginPage';
import { useAdminPanelUrl } from '../utils';

// Only show users who signed up through lesmis
const UsersView = props => <UsersPage {...props} baseFilter={{ primary_platform: 'lesmis' }} />;

const getRoutes = adminUrl => [
  {
    label: 'Survey Data',
    to: `${adminUrl}/survey-responses`,
    icon: <Assignment />,
    tabs: [
      {
        label: 'Review',
        to: '',
        component: DraftSurveyResponsesView,
      },
      {
        label: 'Approved',
        to: '/approved',
        component: ApprovedSurveyResponsesView,
      },
      {
        label: 'Rejected',
        to: '/rejected',
        component: RejectedSurveyResponsesView,
      },
      {
        label: 'Approval Not Required',
        to: '/non-approval',
        component: NonApprovalSurveyResponsesView,
      },
    ],
  },
  {
    label: 'Surveys',
    to: `${adminUrl}/surveys`,
    icon: <Assignment />,
    tabs: [
      {
        label: 'Surveys',
        to: '',
        component: SurveysPage,
      },
      {
        label: 'Questions',
        to: '/questions',
        component: QuestionsPage,
      },
      {
        label: 'Data Elements',
        to: '/data-elements',
        component: DataElementsPage,
      },
    ],
  },
  {
    label: 'Visualisations',
    to: `${adminUrl}/visualisations`,
    icon: <InsertChart />,
    tabs: [
      {
        label: 'Dashboard Items',
        to: '',
        component: props => <DashboardItemsPage {...props} vizBuilderBaseUrl={adminUrl} />,
      },
      {
        label: 'Dashboards',
        to: '/dashboards',
        component: DashboardsPage,
      },
      {
        label: 'Dashboard Relations',
        to: '/dashboard-relations',
        component: DashboardRelationsPage,
      },
      {
        label: 'Map Overlays',
        to: '/map-overlays',
        component: props => <MapOverlaysPage {...props} vizBuilderBaseUrl={adminUrl} />,
      },
      {
        label: 'Map Overlay Groups',
        to: '/map-overlay-groups',
        component: MapOverlayGroupsPage,
      },
      {
        label: 'Map Overlay Group Relations',
        to: '/map-overlay-group-relations',
        component: MapOverlayGroupRelationsPage,
      },
    ],
  },
  {
    label: 'Users & Permissions',
    to: `${adminUrl}/users`,
    icon: <PeopleAlt />,
    tabs: [
      {
        label: 'Users',
        to: '',
        component: UsersView,
      },
      {
        label: 'Permissions',
        to: '/permissions',
        component: PermissionsView,
      },
    ],
  },
];

const AdminPanelApp = ({ user, isBESAdmin }) => {
  const headerEl = React.useRef(null);
  const { path } = useRouteMatch();
  const adminUrl = useAdminPanelUrl();

  const getHeaderEl = () => {
    return headerEl;
  };

  const routes = getRoutes(adminUrl);

  return (
    <Switch>
      <Route path={`${path}/login`} exact>
        <AdminPanelLoginPage />
      </Route>
      <Route path={`${path}/logout`} exact>
        <LogoutPage redirectTo={`${adminUrl}/login`} />
      </Route>
      <LesmisAdminRoute key={`${adminUrl}/viz-builder`} path={`${path}/viz-builder`} isBESAdmin>
        <VizBuilderProviders>
          <VizBuilderApp
            basePath={adminUrl}
            Navbar={({ user: vizBuilderUser }) => <AdminPanelNavbar user={vizBuilderUser} />}
          />
        </VizBuilderProviders>
      </LesmisAdminRoute>
      <PrivateRoute path={`${path}`} loginPath={`${adminUrl}/login`}>
        <AdminPanelNavbar user={user} links={routes} />
        <div ref={headerEl} />
        <Switch>
          {[...routes].map(route => (
            <LesmisAdminRoute key={route.to} path={`${route.to}`} isBESAdmin={isBESAdmin}>
              <TabsToolbar links={route.tabs} maxWidth="xl" />
              <Switch>
                {route.tabs.map(tab => (
                  <Route key={`${route.to}-${tab.to}`} path={`${route.to}${tab.to}`} exact>
                    <tab.component getHeaderEl={getHeaderEl} />
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
  isBESAdmin: PropTypes.bool,
};

AdminPanelApp.defaultProps = {
  isBESAdmin: false,
};

export default connect(
  state => ({
    user: state?.authentication?.user || {},
    isBESAdmin: state?.authentication?.isBESAdmin || false,
  }),
  null,
)(AdminPanelApp);
