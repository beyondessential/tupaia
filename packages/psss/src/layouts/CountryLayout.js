/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import PropTypes from 'prop-types';
import { RouterView } from '../router';

const Main = styled.main`
  background: lightgray;
`;

const Container = styled(MuiContainer)`
  min-height: 800px;
`;

export const CountryLayout = ({ routes, match }) => {
  return (
    <Main>
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
