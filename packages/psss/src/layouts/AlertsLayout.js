/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { WarningCloud, Clipboard, TabsToolbar } from '@tupaia/ui-components';
import { Alarm } from '@material-ui/icons';
import MuiContainer from '@material-ui/core/Container';
import { RouterView } from '../router';
import { Header } from '../components/Header';

const Main = styled.main`
  background: lightgray;
`;

const Container = styled(MuiContainer)`
  min-height: 800px;
`;

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

export const AlertsLayout = ({ routes }) => {
  return (
    <Main>
      <Header title="Alerts" />
      <TabsToolbar links={links} />
      <Container>
        <h2>Alerts Layout</h2>
        <RouterView routes={routes} />
      </Container>
    </Main>
  );
};

AlertsLayout.propTypes = {
  routes: PropTypes.array.isRequired,
};
