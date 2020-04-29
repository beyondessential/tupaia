/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import { PhotoAlbum, CalendarToday } from '@material-ui/icons';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { useParams } from 'react-router-dom';
import { TabsToolbar } from '@tupaia/ui-components';
import { Header } from '../components/Header';
import { WeeklyReportsRoutes } from '../routes/WeeklyReportsRoutes';

const Main = styled.main`
  // nothing
`;

const Container = styled(MuiContainer)`
  min-height: 800px;
  padding-top: 1rem;
`;

const links = [
  {
    label: 'Weekly Case Data',
    to: '',
    icon: <CalendarToday />,
  },
  {
    label: 'Event-based Data',
    to: '/event-based',
    icon: <PhotoAlbum />,
  },
];

export const WeeklyReportsCountryView = ({ match }) => {
  const { countryId } = useParams();
  return (
    <React.Segment>
      <Header title={countryId} />
      <TabsToolbar links={links} />
      <Container>
        <Typography variant="h2" gutterBottom>
          {`Country: ${match.params.countryId}`}
        </Typography>
        <WeeklyReportsRoutes match={match} />
      </Container>
    </React.Segment>
  );
};

WeeklyReportsCountryView.propTypes = {
  match: PropTypes.any.isRequired,
};
