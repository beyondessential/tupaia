/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Switch, Redirect, Route } from 'react-router-dom';
import { TabsToolbar } from '@tupaia/ui-components';
import { Assignment, InsertChart } from '@material-ui/icons';
import {
  DashboardItemsPage,
  DashboardsPage,
  QuestionsPage,
  SurveysPage,
  SurveyResponsesPage,
  StoreProvider,
} from '@tupaia/admin-panel/lib';
import { LesmisAdminRoute } from './LesmisAdminRoute';
import { useUser } from '../api/queries';
import { TupaiaApi } from '../api/TupaiaApi';

const ADMIN_URL = '/admin';

export const ROUTES = [
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
        label: 'Survey Responses',
        to: '/survey-responses',
        component: SurveyResponsesPage,
      },
    ],
  },
  {
    label: 'Visualisations',
    to: `${ADMIN_URL}/dashboard-items`,
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
    ],
  },
];

const HeaderContainer = styled.div`
  background: ${props => props.theme.palette.primary.main};
  border-top: 1px solid rgba(0, 0, 0, 0.2); ;
`;

const api = new TupaiaApi();

export const AdminPanelRoutes = () => {
  const headerEl = React.useRef(null);
  const { isLesmisAdmin } = useUser();

  const getHeaderEl = () => {
    return headerEl;
  };

  return (
    <StoreProvider api={api}>
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
          <Redirect to="/admin/surveys" />
        </Switch>
      </div>
    </StoreProvider>
  );
};
