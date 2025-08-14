import React from 'react';
import styled from 'styled-components';
import { LinkProps } from 'react-router-dom-v6';
import { Typography } from '@material-ui/core';
import { CheckCircle } from '@material-ui/icons';
import { AuthViewWrapper } from '../AuthViewWrapper';
import { AuthSubmitButton } from '../AuthSubmitButton';
import { RouterLink } from '../../RouterLink';

const Wrapper = styled(AuthViewWrapper)`
  &.MuiPaper-root.MuiPaper-rounded {
    height: 27rem;
    justify-content: center;
  }
`;

const Title = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 2rem;
`;

const Description = styled(Typography)`
  font-size: 0.875rem;
  margin: 0.7rem 0;
`;

const CheckIcon = styled(CheckCircle)`
  color: ${({ theme }) => theme.palette.success.main};
  margin-bottom: 1.5rem;
  &.MuiSvgIcon-root {
    font-size: 2.1rem;
  }
`;

interface PasswordResetSuccessProps {
  loginLink: LinkProps['to'];
}

export const ResetPasswordSuccess = ({ loginLink }: PasswordResetSuccessProps) => {
  return (
    <Wrapper>
      <CheckIcon />
      <Title>Password reset!</Title>
      <Description>Your password has been successfully reset</Description>
      <AuthSubmitButton to={loginLink} component={RouterLink}>
        Back to login
      </AuthSubmitButton>
    </Wrapper>
  );
};
