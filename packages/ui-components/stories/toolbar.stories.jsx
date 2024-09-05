/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Alarm } from '@material-ui/icons';
import { TabsToolbar, Clipboard, WarningCloud } from '../src/components';
import { ReactRouterV5Decorator } from '../helpers';

export default {
  title: 'Toolbar',
  decorators: [story => <ReactRouterV5Decorator>{story()}</ReactRouterV5Decorator>],
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
