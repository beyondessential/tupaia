/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { RouterButton } from '../../components/RouterButton';
import styled from 'styled-components';
import { USER_ROUTES } from '../../Routes.tsx';

const FormLink = styled.a`
  color: white;
  font-weight: 500;
`;

const Container = styled.div`
  margin: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;

  button {
    margin-top: 20px;
    width: 50%;
  }
`;

export const SignupComplete = () => {
  return (
    <Container>
      <div>
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
      </div>
      <RouterButton to={USER_ROUTES.LOGIN}>Re-send verification email</RouterButton>
    </Container>
  );
};
