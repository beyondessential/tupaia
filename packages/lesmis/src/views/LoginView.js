/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { useHistory } from 'react-router-dom';
import MuiCard from '@material-ui/core/Card';
import IconButton from '@material-ui/core/IconButton';
import styled from 'styled-components';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import { LoginForm, FlexCenter, FlexColumn } from '../components';

const Container = styled(FlexColumn)`
  padding-top: 3rem;
  min-height: 70vh;
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
  margin-right: 0.3rem;
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 0.3rem;
  right: 0.6rem;
`;

export const LoginView = () => {
  const history = useHistory();
  const handleClose = () => {
    history.goBack();
  };
  return (
    <Container>
      <CloseButton color="inherit" onClick={handleClose} aria-label="close">
        <CloseIcon />
      </CloseButton>
      <StyledImg src="/lesmis-login-logo.svg" alt="lesmis-logo" />
      <StyledCard>
        <LoginForm />
      </StyledCard>
      <FlexCenter mb={4}>
        <Text color="textSecondary">Don&apos;t have access?</Text>
        <Text href="https://tupaia.org" target="_blank" color="primary">
          Register here
        </Text>
      </FlexCenter>
    </Container>
  );
};
