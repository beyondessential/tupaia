/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { RouterButton } from '../../components';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import { MODAL_ROUTES } from '../../constants';

const Container = styled.div`
  margin: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 100%;
  width: 36rem;

  a {
    margin-top: 2rem;
    width: 50%;
  }
`;

const FormLink = styled.a`
  color: white;
  font-weight: 500;
`;

export const SignupComplete = () => {
  return (
    <Container>
      <Typography>
        Congratulations, you have successfully signed up to Tupaia. To activate your account please{' '}
        <b>click the verification link in your email.</b> Once activated, you can use your new
        account to log in to tupaia.org as well as our app, Tupaia Meditrak on{' '}
        <FormLink
          href="https://itunes.apple.com/us/app/tupaia-meditrak/id1245053537?mt=8"
          target="_blank"
          rel="noopener noreferrer"
        >
          &nbsp;iOS
        </FormLink>
        &nbsp;and
        <FormLink
          href="https://play.google.com/store/apps/details?id=com.tupaiameditrak&hl=en"
          target="_blank"
          rel="noopener noreferrer"
        >
          &nbsp;Android&nbsp;.
        </FormLink>
      </Typography>
      <RouterButton to={`?modal=${MODAL_ROUTES.LOGIN}`}>Re-send verification email</RouterButton>
    </Container>
  );
};
