/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Breadcrumbs, LightBreadcrumbs } from '../components/Breadcrumbs';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';
import Provider from '../RouterProvider.js';
import { Link as RouterLink } from 'react-router-dom';
import { Tabs, Tab, LightTabs, LightTab } from '../components/Tabs';
import * as COLORS from '../theme/colors';

const Container = styled(MuiBox)`
  max-width: 1200px;
  padding: 1rem;

  .MuiTabs-root {
    margin-top: 2rem;
  }
`;

export default {
  title: 'Breadcrumbs',
  decorators: [story => <Provider>{story()}</Provider>],
};

export const breadcrumbs = () => {
  return (
    <Container>
      <Breadcrumbs />
      <Tabs indicatorColor="primary" textColor="primary">
        <Tab component={RouterLink} to="/">
          Dashboard
        </Tab>
        <Tab component={RouterLink} to="/outbreaks">
          Outbreaks
        </Tab>
        <Tab component={RouterLink} to="/alerts">
          Alerts
        </Tab>
        <Tab component={RouterLink} to="/alerts/covid-19">
          Alerts / Covid-19
        </Tab>
      </Tabs>
    </Container>
  );
};

export const lightBreadcrumbs = () => (
  <Container bgcolor={COLORS.BLUE}>
    <LightBreadcrumbs />
    <LightTabs indicatorColor="primary" textColor="primary">
      <LightTab component={RouterLink} to="/">
        Dashboard
      </LightTab>
      <LightTab component={RouterLink} to="/outbreaks">
        Outbreaks
      </LightTab>
      <LightTab component={RouterLink} to="/alerts">
        Alerts
      </LightTab>
      <LightTab component={RouterLink} to="/alerts/covid-19">
        Alerts / Covid-19
      </LightTab>
    </LightTabs>
  </Container>
);
