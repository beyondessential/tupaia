/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Dashboard, Warning, NewReleases } from '@material-ui/icons';
import MuiBox from '@material-ui/core/Box';
import { Tabs, Tab, LightTabs, LightTab } from '../src/components';
import * as COLORS from './story-utils/theme/colors';

export default {
  title: 'Tabs',
  component: Tabs,
};

const Container = styled(MuiBox)`
  max-width: 1200px;
  padding: 1rem;
`;

export const tabs = () => (
  <Container>
    <Tabs indicatorColor="primary" textColor="primary">
      <Tab>Dashboard</Tab>
      <Tab>Alerts</Tab>
    </Tabs>
  </Container>
);

export const iconTabs = () => (
  <Container>
    <Tabs indicatorColor="primary" textColor="primary">
      <Tab>
        <Dashboard /> Dashboard
      </Tab>
      <Tab>
        <Warning /> Alerts
      </Tab>
    </Tabs>
  </Container>
);

export const lightTabs = () => (
  <Container bgcolor={COLORS.BLUE}>
    <LightTabs>
      <LightTab>
        <Dashboard /> Dashboard
      </LightTab>
      <LightTab>
        <Warning /> Alerts
      </LightTab>
      <LightTab>
        <NewReleases /> Outbreaks
      </LightTab>
    </LightTabs>
  </Container>
);
