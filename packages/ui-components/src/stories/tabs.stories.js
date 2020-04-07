/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Tabs, Tab, LightTabs, LightTab } from '../components/Tabs';
import styled from 'styled-components';
import { Dashboard, Warning, NewReleases } from '@material-ui/icons';
import * as COLORS from '../theme/colors';

export default {
  title: 'Tabs',
  component: Tabs,
};

const Container = styled.div`
  max-width: 1200px;
  margin: 1rem;
`;

export const tabs = () => (
  <Container>
    <Tabs indicatorColor="primary" textColor="primary">
      <Tab>Dashboard</Tab>
      <Tab>Alerts</Tab>
    </Tabs>
  </Container>
);

export const lightTabs = () => (
  <Container>
    <LightTabs>
      <LightTab>
        <Dashboard />
        Dashboard
      </LightTab>
      <LightTab>
        <Warning />
        Alerts
      </LightTab>
      <LightTab>
        <NewReleases />
        Outbreaks
      </LightTab>
    </LightTabs>
  </Container>
);

lightTabs.story = {
  parameters: {
    backgrounds: [{ name: 'Header', value: COLORS.BLUE, default: true }],
  },
};
