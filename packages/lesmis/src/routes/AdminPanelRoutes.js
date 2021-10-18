/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Switch, Redirect, Route } from 'react-router-dom';
import { TabsToolbar } from '@tupaia/ui-components';
import { Assignment, InsertChart, PeopleAlt } from '@material-ui/icons';
import {
  DashboardItemsPage,
  DashboardsPage,
  QuestionsPage,
  SurveysPage,
  DataElementsPage,
  DashboardRelationsPage,
  MapOverlayGroupRelationsPage,
  MapOverlayGroupsPage,
  MapOverlaysPage,
  AccessRequestsPage,
  PermissionGroupsPage,
  PermissionsPage,
  SurveyResponsesPage,
  UsersPage,
  AdminPanelDataProviders,
} from '@tupaia/admin-panel/lib';
import { LesmisAdminRoute } from './LesmisAdminRoute';
import { useUser } from '../api/queries';
import { getApiUrl } from '../utils/getApiUrl';

/* eslint-disable */
import {
  ApprovedSurveyResponsesView,
  DraftSurveyResponsesView,
} from '../views/SurveyResponsesView';

const ADMIN_URL = '/admin';

// Todo: Replace SurveyResponsesPage with ApprovedSurveyResponsesView and DraftSurveyResponsesView
// @see WAI-832
export const ROUTES = [
  {
    label: 'Survey Data',
    to: `${ADMIN_URL}/survey-responses`,
    icon: <Assignment />,
    tabs: [
      // {
      //   label: 'Review',
      //   to: '',
      //   component: DraftSurveyResponsesView,
      // },
      // {
      //   label: 'Approved',
      //   to: '/approved',
      //   component: ApprovedSurveyResponsesView,
      // },
      {
        label: 'Survey Responses',
        to: '',
        component: SurveyResponsesPage,
      },
    ],
  },
  {
    label: 'Surveys',
    to: `${ADMIN_URL}/surveys`,
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
    to: `${ADMIN_URL}/visualisations`,
    icon: <InsertChart />,
    tabs: [
      {
        label: 'Dashboard Items',
        to: '',
        component: DashboardItemsPage,
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
        component: MapOverlaysPage,
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
    to: '/admin/users',
    icon: <PeopleAlt />,
    tabs: [
      {
        label: 'Users',
        to: '',
        component: UsersPage,
      },
      {
        label: 'Permissions',
        to: '/permissions',
        component: PermissionsPage,
      },
      {
        label: 'Permission Groups',
        to: '/permission-groups',
        component: PermissionGroupsPage,
      },
      {
        label: 'Access Requests',
        to: '/access-requests',
        component: AccessRequestsPage,
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
            <LesmisAdminRoute key={route.to} path={route.to}>
              <TabsToolbar links={route.tabs} maxWidth="xl" />
              <Switch>
                {route.tabs.map(tab => (
                  <Route key={`${route.to}-${tab.to}`} path={`${route.to}${tab.to}`} exact>
                    <tab.component getHeaderEl={getHeaderEl} isBESAdmin={isLesmisAdmin} />
                  </Route>
                ))}
                <Redirect to={route.to} />
              </Switch>
            </LesmisAdminRoute>
          ))}
          <Redirect to="/admin/survey-responses" />
        </Switch>
      </div>
    </AdminPanelDataProviders>
  );
};

// Must be a default export as React.lazy currently only supports default exports.
export default AdminPanelRoutes;
