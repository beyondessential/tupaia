/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import {
  CardTabs,
  CardTabList,
  CardTab,
  CardTabPanels,
  CardTabPanel,
  DataCardTabs,
} from '../components/CardTabs';
import styled from 'styled-components';
import Card from '@material-ui/core/Card';
import { ErrorOutline, NotificationImportant } from '@material-ui/icons';

export default {
  title: 'CardTabs',
  component: CardTabs,
};

const Container = styled.div`
  max-width: 360px;
  margin: 1rem;
`;

const Tab1Label = () => (
  <React.Fragment>
    <ErrorOutline /> 3 Active Alerts
  </React.Fragment>
);
const Tab2Label = () => (
  <React.Fragment>
    <NotificationImportant /> 1 Active Outbreak
  </React.Fragment>
);
const Tab1Content = () => (
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
    labore et dolore magna aliqua.
  </p>
);
const Tab2Content = () => (
  <React.Fragment>
    <p>Sed ut perspiciatis unde omnis iste natus error sit </p>
    <ul>
      <li>voluptatem accusantium</li>
      <li>doloremque laudantium</li>
      <li>voluptatem accusantium</li>
    </ul>
  </React.Fragment>
);

export const simple = () => {
  return (
    <Container style={{ maxWidth: '500px' }}>
      <Card variant="outlined">
        <CardTabs>
          <CardTabList>
            <CardTab>Notes</CardTab>
            <CardTab>Documents</CardTab>
            <CardTab>Activity</CardTab>
            <CardTab>Affected Sites</CardTab>
          </CardTabList>
          <CardTabPanels>
            <CardTabPanel>Notes...</CardTabPanel>
            <CardTabPanel>Documents...</CardTabPanel>
            <CardTabPanel>Activity...</CardTabPanel>
            <CardTabPanel>Affected Sites...</CardTabPanel>
          </CardTabPanels>
        </CardTabs>
      </Card>
    </Container>
  );
};

export const icons = () => {
  return (
    <Container>
      <Card variant="outlined">
        <CardTabs>
          <CardTabList>
            <CardTab>
              <Tab1Label />
            </CardTab>
            <CardTab>
              <Tab2Label />
            </CardTab>
          </CardTabList>
          <CardTabPanels>
            <CardTabPanel>
              <Tab1Content />
            </CardTabPanel>
            <CardTabPanel>
              <Tab2Content />
            </CardTabPanel>
          </CardTabPanels>
        </CardTabs>
      </Card>
    </Container>
  );
};

const tabData = [
  {
    label: <Tab1Label />,
    content: <Tab1Content />,
  },
  {
    label: <Tab2Label />,
    content: <Tab2Content />,
  },
];

export const data = () => (
  <Container>
    <Card variant="outlined">
      <DataCardTabs data={tabData} />
    </Card>
  </Container>
);
