/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import MuiContainer from '@material-ui/core/Container';
import { Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import { AlertsRoutes } from '../routes/AlertsRoutes';

const Main = styled.main`
  background: lightgray;
  padding-top: 1rem;
`;

const Container = styled(MuiContainer)`
  min-height: 800px;
`;

export const AlertsView = ({ match }) => {
  return (
    <Main>
      <Container>
        <Typography variant="h2" gutterBottom>
          Alerts Layout
        </Typography>
        <ul>
          <li>
            <Link to={`${match.url}`}>Alerts</Link>
          </li>
          <li>
            <Link to={`${match.url}/outbreaks`}>Outbreaks</Link>
          </li>
          <li>
            <Link to={`${match.url}/archive`}>Archive</Link>
          </li>
        </ul>
        <AlertsRoutes match={match} />
      </Container>
    </Main>
  );
};

AlertsView.propTypes = {
  match: PropTypes.any.isRequired,
};
