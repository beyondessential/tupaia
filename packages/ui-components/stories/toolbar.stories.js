/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Alarm } from '@material-ui/icons';
import { TabsToolbar, Clipboard, WarningCloud } from '../src/components';
import { RouterProvider } from '../helpers/RouterProvider';

export default {
  title: 'Toolbar',
  decorators: [story => <RouterProvider>{story()}</RouterProvider>],
};
/**
 * links are slightly adjusted to work with storybook.
 */
const links = [
  {
    label: 'Alerts',
    to: 'iframe.html',
    icon: <Alarm />,
  },
  {
    label: 'Outbreak',
    to: 'outbreaks',
    icon: <WarningCloud />,
  },
  {
    label: 'Archive',
    to: 'archive',
    icon: <Clipboard />,
  },
];

export const tabsToolbar = () => <TabsToolbar links={links} baseRoute="theBaseRoute" />;
