/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Tabs, TabList, Tab, TabPanels, TabPanel, DataTabs } from '../components/Tabs';
import styled from 'styled-components';
import Card from '@material-ui/core/Card';
import { ErrorOutline, NotificationImportant } from '@material-ui/icons';

export default {
  title: 'Tabs',
  component: Tabs,
};

const Container = styled.div`
  max-width: 360px;
  margin: 1rem;
`;

export const tabs = () => {
  return (
    <Container>
      <Card variant="outlined">
        <Tabs>
          <TabList>
            <Tab>
              <ErrorOutline /> 3 Active Alerts
            </Tab>
            <Tab>
              <NotificationImportant /> 1 Active Outbreak
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua.
              </p>
            </TabPanel>
            <TabPanel>
              <p>Sed ut perspiciatis unde omnis iste natus error sit </p>
              <ul>
                <li>voluptatem accusantium</li>
                <li>doloremque laudantium</li>
                <li>voluptatem accusantium</li>
              </ul>
            </TabPanel>
          </TabPanels>
        </Tabs>
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
      <DataTabs data={tabData} />
    </Card>
  </Container>
);