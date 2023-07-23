/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';
import { Link as RouterLink } from 'react-router-dom';
import * as COLORS from './story-utils/theme/colors';
import { RouterProvider } from '../helpers/RouterProvider';
import { Breadcrumbs, LightBreadcrumbs, Tabs, Tab, LightTabs, LightTab } from '../src/components';

const Container = styled(MuiBox)`
  max-width: 1200px;
  padding: 1rem;

  .MuiTabs-root {
    margin-top: 2rem;
  }
`;

export default {
  title: 'Breadcrumbs',
  decorators: [story => <RouterProvider>{story()}</RouterProvider>],
};

export const example = () => {
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
