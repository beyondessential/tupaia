/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { WarningCloud, Clipboard, TabsToolbar } from '@tupaia/ui-components';
import Typography from '@material-ui/core/Typography';
import { Alarm } from '@material-ui/icons';
import MuiContainer from '@material-ui/core/Container';
import { Header } from '../components/Header';
import { Main } from '../components';
import { AlertsRoutes } from '../routes/AlertsRoutes';

const links = [
  {
    label: 'Alerts',
    to: '',
    icon: <Alarm />,
  },
  {
    label: 'Outbreak',
    to: '/outbreaks',
    icon: <WarningCloud />,
  },
  {
    label: 'Archive',
    to: '/archive',
    icon: <Clipboard />,
  },
];

export const AlertsView = ({ match }) => {
  return (
    <React.Fragment>
      <Header title="Alerts" />
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

AlertsView.propTypes = {
  match: PropTypes.any.isRequired,
};
