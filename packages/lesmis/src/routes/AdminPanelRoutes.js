/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Switch, Redirect, Route, useRouteMatch } from 'react-router-dom';
import { TabsToolbar } from '@tupaia/ui-components';
import { Assignment, InsertChart, PeopleAlt } from '@material-ui/icons';
import {
  DashboardsPage,
  QuestionsPage,
  SurveysPage,
  DataElementsPage,
  DashboardRelationsPage,
  MapOverlayGroupRelationsPage,
  MapOverlayGroupsPage,
  MapOverlaysPage,
  PermissionsPage,
  UsersPage,
  AdminPanelDataProviders,
} from '@tupaia/admin-panel/lib';
import { LesmisAdminRoute } from './LesmisAdminRoute';
import { useUser } from '../api/queries';
import { getApiUrl } from '../utils/getApiUrl';
import { DashboardItemsView } from '../views/AdminPanel/DashboardItemsView';
import {
  ApprovedSurveyResponsesView,
  DraftSurveyResponsesView,
  RejectedSurveyResponsesView,
  NonApprovalSurveyResponsesView,
} from '../views/AdminPanel/SurveyResponsesView';
import { LESMIS_PERMISSION_GROUPS } from '../constants';

// Only show users who signed up through lesmis
const UsersView = props => <UsersPage {...props} baseFilter={{ primary_platform: 'lesmis' }} />;

// Only show lesmis permission groups
const PermissionsView = props => (
  <PermissionsPage
    {...props}
    baseFilter={{
      'permission_group.name': {
        comparator: 'in',
        comparisonValue: Object.values(LESMIS_PERMISSION_GROUPS),
      },
    }}
  />
);

// Hide the new button until there is a viz builder in lesmis
const MapOverlaysView = props => <MapOverlaysPage {...props} LinksComponent={null} />;

export const ROUTES = [
  {
    label: 'Survey Data',
    to: '/survey-responses',
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
    to: '/surveys',
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
    to: '/visualisations',
    icon: <InsertChart />,
    tabs: [
      {
        label: 'Dashboard Items',
        to: '',
        component: DashboardItemsView,
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
        component: MapOverlaysView,
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
    to: '/users',
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

const config = { apiUrl: `${getApiUrl()}/admin` };

const HeaderContainer = styled.div`
  background: ${props => props.theme.palette.primary.main};
  border-top: 1px solid rgba(0, 0, 0, 0.2); ;
`;

const AdminPanelRoutes = () => {
  const headerEl = React.useRef(null);
  const { path } = useRouteMatch();
  const { isLesmisAdmin } = useUser();

  const getHeaderEl = () => {
    return headerEl;
  };

  return (
    <AdminPanelDataProviders config={config}>
      <div>
        <HeaderContainer ref={headerEl} />
        <Switch>
          {[...ROUTES].map(route => (
            <LesmisAdminRoute key={route.to} path={`${path}${route.to}`}>
              <TabsToolbar links={route.tabs} maxWidth="xl" />
              <Switch>
                {route.tabs.map(tab => (
                  <Route key={`${route.to}-${tab.to}`} path={`${path}${route.to}${tab.to}`} exact>
                    <tab.component getHeaderEl={getHeaderEl} isBESAdmin={isLesmisAdmin} />
                  </Route>
                ))}
                <Redirect to={`${path}${route.to}`} />
              </Switch>
            </LesmisAdminRoute>
          ))}
          <Redirect to={`${path}/survey-responses`} />
        </Switch>
      </div>
    </AdminPanelDataProviders>
  );
};

// Must be a default export as React.lazy currently only supports default exports.
export default AdminPanelRoutes;
