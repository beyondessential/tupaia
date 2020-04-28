/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Alarm } from '@material-ui/icons';
import { TabsToolbar } from '../components/Toolbar';
import { Clipboard, WarningCloud } from '../components/Icons';
import { RouterProvider } from '../RouterProvider';

export default {
  title: 'Toolbar',
  decorators: [story => <RouterProvider>{story()}</RouterProvider>],
};

const links = [
  {
    label: 'Alerts',
    to: '',
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

export const tabsToolbar = () => <TabsToolbar links={links} />;
