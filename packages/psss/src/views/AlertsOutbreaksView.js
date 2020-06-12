/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { WarningCloud, TabsToolbar, Virus } from '@tupaia/ui-components';
import { Archive } from '@material-ui/icons';
import { Header } from '../components';
import { AlertsRoutes } from '../routes/AlertsRoutes';

const links = [
  {
    label: 'Alerts',
    to: '',
    icon: <WarningCloud />,
  },
  {
    label: 'Outbreak',
    to: '/outbreaks',
    icon: <Virus />,
  },
  {
    label: 'Archive',
    to: '/archive',
    icon: <Archive />,
  },
];

export const AlertsOutbreaksView = () => (
  <React.Fragment>
    <Header title="Alerts & Outbreaks" />
    <TabsToolbar links={links} />
    <AlertsRoutes />
  </React.Fragment>
);
