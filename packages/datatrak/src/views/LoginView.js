/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import MuiCard from '@material-ui/core/Card';
import styled from 'styled-components';
import { LoginForm, FlexColumn } from '../components';
import Typography from '@material-ui/core/Typography';

const Container = styled.div`
  text-align: center;
  padding-top: 20px;
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

const Title = styled(Typography)`
  font-weight: 700;
  font-size: 32px;
  line-height: 38px;
  margin-bottom: 40px;
  color: #004167;
`;

export const LoginView = () => (
  <Container>
    <Title>Login</Title>
    <StyledCard>
      <LoginForm />
    </StyledCard>
  </Container>
);
