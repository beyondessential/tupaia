/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import MuiCard from '@material-ui/core/Card';
import styled from 'styled-components';
import { LoginForm, FlexColumn } from '../components';

const Container = styled(FlexColumn)`
  padding-top: 3rem;
  min-height: 70vh;
`;

const StyledCard = styled(MuiCard)`
  width: 28rem;
  padding: 2.5rem 3.5rem 3rem 3rem;
  margin: 0 auto 2rem;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
  ${props => props.theme.breakpoints.down('sm')} {
    box-shadow: none;
  }
`;

const StyledImg = styled.img`
  height: 6.5rem;
  width: auto;
  margin-bottom: 2rem;
`;

export const LoginView = () => (
  <Container>
    <StyledImg src="/lesmis-login-logo.svg" alt="lesmis-logo" />
    <StyledCard>
      <LoginForm />
    </StyledCard>
  </Container>
);
