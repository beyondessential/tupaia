/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import MuiCard from '@material-ui/core/Card';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { LoginForm, FlexCenter, FlexColumn, FormBackButton } from '../components';
import { LocaleLink } from '../components/LocaleLinks';

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

const Text = styled(Typography)`
  font-size: 0.875rem;
  line-height: 1rem;
  margin-right: 5px;
`;

const Link = styled(LocaleLink)`
  font-size: 0.875rem;
  line-height: 1rem;
  text-decoration: none;
`;

export const LoginView = () => (
  <Container>
    <FormBackButton />
    <StyledImg src="/lesmis-login-logo.svg" alt="lesmis-logo" />
    <StyledCard>
      <LoginForm />
    </StyledCard>
    <FlexCenter mb={4}>
      <Text color="textSecondary">Don&apos;t have access?</Text>
      <Link to="/register" color="primary">
        Register here
      </Link>
    </FlexCenter>
  </Container>
);
