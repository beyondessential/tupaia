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

export const tabs = () => {
  return (
    <Container>
      <Card variant="outlined">
        <CardTabs>
          <CardTabList>
            <CardTab>
              <ErrorOutline /> 3 Active Alerts
            </CardTab>
            <CardTab>
              <NotificationImportant /> 1 Active Outbreak
            </CardTab>
          </CardTabList>
          <CardTabPanels>
            <CardTabPanel>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua.
              </p>
            </CardTabPanel>
            <CardTabPanel>
              <p>Sed ut perspiciatis unde omnis iste natus error sit </p>
              <ul>
                <li>voluptatem accusantium</li>
                <li>doloremque laudantium</li>
                <li>voluptatem accusantium</li>
              </ul>
            </CardTabPanel>
          </CardTabPanels>
        </CardTabs>
      </Card>
    </Container>
  );
};

const Tab1Label = () => (
  <>
    <ErrorOutline /> 3 Active Alerts
  </>
);
const Tab2Label = () => (
  <>
    <NotificationImportant /> 1 Active Outbreak
  </>
);
const Tab1Content = () => <div>Tab 1 Content</div>;
const Tab2Content = () => <div>Tab 2 Content</div>;

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

export const dataTabs = () => (
  <Container>
    <Card variant="outlined">
      <DataCardTabs data={tabData} />
    </Card>
  </Container>
);
