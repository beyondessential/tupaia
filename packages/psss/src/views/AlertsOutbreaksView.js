/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { CalendarToday, TabsToolbar } from '@tupaia/ui-components';
import { PhotoAlbum } from '@material-ui/icons';
import { Header } from '../components';
import { AlertsRoutes } from '../routes/AlertsRoutes';

const links = [
  {
    label: 'Alerts',
    to: '',
    icon: <CalendarToday />,
  },
  {
    label: 'Outbreak',
    to: '/outbreaks',
    icon: <PhotoAlbum />,
  },
  {
    label: 'Archive',
    to: '/archive',
    icon: <PhotoAlbum />,
  },
];

export const AlertsOutbreaksView = () => (
  <React.Fragment>
    <Header title="Alerts & Outbreaks" />
    <TabsToolbar links={links} />
    <AlertsRoutes />
  </React.Fragment>
);
