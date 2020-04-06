/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Tabs } from '../components/Tabs';
import styled from 'styled-components';
import { ErrorOutline, NotificationImportant } from '@material-ui/icons';

export default {
  title: 'Tabs',
};

const Container = styled.div`
  max-width: 360px;
  margin: 1rem;
`;

const Tab1Label = () => (
  <div style={{ display: 'flex' }}>
    Tab 1 Content
    <ErrorOutline />
  </div>
);
const Tab2Label = () => <div>Tab 1 Content</div>;
const Tab1Content = () => <div>Tab 1 Content</div>;
const Tab2Content = () => <div>Tab 2 Content</div>;

const tabData = [
  {
    label: <Tab1Label />,
    content: <Tab1Content />,
  },
  {
    label: '1 Active Outbreak',
    icon: <NotificationImportant />,
    content: <Tab2Content />,
  },
];

export const CustomTabs = () => (
  <Container>
    <Tabs data={tabData} />
  </Container>
);
