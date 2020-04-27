/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import { PhotoAlbum, CalendarToday } from '@material-ui/icons';
import PropTypes from 'prop-types';
import { TabsToolbar } from '../components/Toolbar';
import { RouterView } from '../router';
import { Header } from '../components/Header';
import { useParams } from 'react-router-dom';

const Main = styled.main`
  background: lightgray;
`;

const Container = styled(MuiContainer)`
  min-height: 800px;
`;

const links = [
  {
    label: 'Weekly Case Data',
    to: '',
    icon: <PhotoAlbum />,
  },
  {
    label: 'Event-based Data',
    to: '/event-based',
    icon: <CalendarToday />,
  },
];

export const CountryLayout = ({ routes, match }) => {
  const { countryId } = useParams();
  return (
    <Main>
      <Header title={countryId} />
      <TabsToolbar links={links} />
      <Container>
        <h2>{`Country: ${match.params.countryId}`}</h2>
        <RouterView routes={routes} />
      </Container>
    </Main>
  );
};

CountryLayout.propTypes = {
  routes: PropTypes.array.isRequired,
  match: PropTypes.any.isRequired,
};
