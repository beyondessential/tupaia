/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Provider } from 'react-redux';
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
} from '@tupaia/admin-panel/lib';
import { store } from '../admin-panel';
import { LesmisAdminRoute } from './LesmisAdminRoute';

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

export const AdminPanelRoutes = () => {
  const headerEl = React.useRef(null);

  const getHeaderEl = () => {
    return headerEl;
  };

  return (
    <Provider store={store}>
      <div>
        <HeaderContainer ref={headerEl} />
        <Switch>
          {[...ROUTES].map(route => (
            <LesmisAdminRoute key={route.to} path={route.to}>
              <TabsToolbar links={route.tabs} maxWidth="xl" style={{ background: '#D13333' }} />
              <Switch>
                {route.tabs.map(tab => (
                  <Route key={`${route.to}-${tab.to}`} path={`${route.to}${tab.to}`} exact>
                    <tab.component getHeaderEl={getHeaderEl} isBESAdmin />
                  </Route>
                ))}
                <Redirect to={route.to} />
              </Switch>
            </LesmisAdminRoute>
          ))}
          <Redirect to="/admin/surveys" />
        </Switch>
      </div>
    </Provider>
  );
};
