/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import MuiCard from '@material-ui/core/Card';
import styled from 'styled-components';
import { Link as RouterLink } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import { LoginForm, FlexCenter, FlexColumn } from '../components';

const Container = styled(FlexColumn)`
  padding-top: 3rem;
  height: 80vh;
`;

const StyledCard = styled(MuiCard)`
  width: 28rem;
  padding: 2.5rem 3.5rem 3rem 3rem;
  margin: 0 auto 2rem;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
`;

const StyledImg = styled.img`
  height: 6.5rem;
  width: auto;
  margin-bottom: 2rem;
`;

const Text = styled(Typography)`
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1rem;
  text-decoration: none;
  margin-right: 5px;
`;

export const LoginView = () => (
  <Container>
    <StyledImg src="/lesmis-login-logo.svg" alt="lesmis-logo" />
    <StyledCard>
      <LoginForm />
    </StyledCard>
    <FlexCenter mb={4}>
      <Text color="textSecondary">Don&apos;t have access?</Text>
      <Text component={RouterLink} to="register" color="primary">
        Register here
      </Text>
    </FlexCenter>
  </Container>
);
