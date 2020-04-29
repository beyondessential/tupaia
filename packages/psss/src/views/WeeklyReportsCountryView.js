/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import { WeeklyReportsRoutes } from '../routes/WeeklyReportsRoutes';

const Main = styled.main`
  background: lightgray;
  padding-top: 1rem;
`;

const Container = styled(MuiContainer)`
  min-height: 800px;
`;

export const WeeklyReportsCountryView = ({ match }) => {
  return (
    <Main>
      <Container>
        <Typography variant="h2" gutterBottom>
          {`Country: ${match.params.countryId}`}
        </Typography>
        <ul>
          <li>
            <Link to={`${match.url}`}>Weekly Case Data</Link>
          </li>
          <li>
            <Link to={`${match.url}/event-based`}>Event-based Data</Link>
          </li>
        </ul>
        <WeeklyReportsRoutes match={match} />
      </Container>
    </Main>
  );
};

WeeklyReportsCountryView.propTypes = {
  match: PropTypes.any.isRequired,
};
