/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { CalendarToday, PhotoAlbum } from '@material-ui/icons';
import MuiContainer from '@material-ui/core/Container';
import { TabsToolbar } from '../components/Toolbar';
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
    icon: <PhotoAlbum />,
  },
  {
    label: 'Outbreak',
    to: '/outbreaks',
    icon: <CalendarToday />,
  },
  {
    label: 'Archive',
    to: '/archive',
    icon: <CalendarToday />,
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
