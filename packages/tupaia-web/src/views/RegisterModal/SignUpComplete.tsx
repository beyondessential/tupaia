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
  width: 40rem;

  a {
    margin-top: 2.5rem;
    margin-bottom: 2rem;
    width: 20rem;
    max-width: 100%;
    text-transform: none;
  }
`;

export const SignUpComplete = () => {
  return (
    <Container>
      <Typography>
        Congratulations, you have successfully signed up to Tupaia. To activate your account please
        click the verification link in your email. Once activated, you can use your new account to
        log in to tupaia.org and the Tupaia Meditrak app.
      </Typography>
      <RouterButton modal={MODAL_ROUTES.VERIFY_EMAIL_RESEND}>
        Resend verification email
      </RouterButton>
    </Container>
  );
};
