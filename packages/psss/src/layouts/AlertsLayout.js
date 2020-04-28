/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import MuiContainer from '@material-ui/core/Container';
import { RouterView } from '../router';

const Main = styled.main`
  background: lightgray;
`;

const Container = styled(MuiContainer)`
  min-height: 800px;
`;

export const AlertsLayout = ({ routes }) => {
  return (
    <Main>
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
