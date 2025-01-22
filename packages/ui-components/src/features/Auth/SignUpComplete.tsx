import React from 'react';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import { RouterLink } from '../RouterLink';

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
    text-align: center;
  }
`;

interface SignUpCompleteProps {
  verifyResendLink: string;
  successMessage: string;
}
export const SignUpComplete = ({ verifyResendLink, successMessage }: SignUpCompleteProps) => {
  return (
    <Container>
      <Typography>{successMessage}</Typography>
      <RouterLink to={verifyResendLink}>Resend verification email</RouterLink>
    </Container>
  );
};
