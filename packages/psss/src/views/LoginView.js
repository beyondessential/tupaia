/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiCard from '@material-ui/core/Card';
import styled from 'styled-components';
import { LoginForm } from '../components';
import * as COLORS from '../theme/colors';

export const Main = styled.main`
  background-color: ${COLORS.BLUE};
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-bottom: 10%;
`;

export const StyledCard = styled(MuiCard)`
  max-width: 400px;
  width: 400px;
  padding: 2rem;
  margin: 0 auto;
`;

export const LoginView = ({ handleLogin }) => {
  return (
    <Main>
      <StyledCard>
        <LoginForm handleLogin={handleLogin} />
      </StyledCard>
    </Main>
  );
};
