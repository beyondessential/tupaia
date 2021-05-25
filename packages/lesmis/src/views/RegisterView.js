/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import IconButton from '@material-ui/core/IconButton';
import MuiCard from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import { RegisterForm, FlexCenter, FlexColumn } from '../components';

export const Container = styled(FlexColumn)`
  padding-top: 2rem;
  padding-bottom: 2rem;
  min-height: 90vh;
`;

const StyledCard = styled(MuiCard)`
  width: 50rem;
  max-width: 100%;
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
  font-size: 0.875rem;
  line-height: 1rem;
  text-decoration: none;
  margin-right: 5px;
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 0.3rem;
  right: 0.6rem;
`;

export const RegisterView = () => {
  const history = useHistory();

  const handleClose = () => {
    if (history.location?.state?.referer) {
      history.push(history.location.state.referer);
    } else {
      history.push('/');
    }
  };
  return (
    <Container>
      <CloseButton color="inherit" onClick={handleClose} aria-label="close">
        <CloseIcon />
      </CloseButton>
      <StyledImg src="/lesmis-login-logo.svg" alt="lesmis-logo" />
      <StyledCard>
        <RegisterForm />
      </StyledCard>
      <FlexCenter mb={4}>
        <Text color="textSecondary">Already have an account?</Text>
        <Text component={RouterLink} to="login" color="primary">
          Log in
        </Text>
      </FlexCenter>
    </Container>
  );
};
