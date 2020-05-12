/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { CalendarToday, TabsToolbar } from '@tupaia/ui-components';
import Typography from '@material-ui/core/Typography';
import { useRouteMatch } from 'react-router-dom';
import { PhotoAlbum } from '@material-ui/icons';
import MuiContainer from '@material-ui/core/Container';
import { Header, Main } from '../components';
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

export const AlertReportsView = () => {
  const match = useRouteMatch();

  return (
    <React.Fragment>
      <Header title="Alerts & Outbreaks" />
      <TabsToolbar links={links} />
      <MuiContainer>
        <Main>
          <Typography variant="h2" gutterBottom>
            Alerts Layout
          </Typography>
          <AlertsRoutes match={match} />
        </Main>
      </MuiContainer>
    </React.Fragment>
  );
};
