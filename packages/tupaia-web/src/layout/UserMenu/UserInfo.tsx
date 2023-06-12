/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { LinkProps } from 'react-router-dom';
import { USER_ROUTES } from '../../Routes';
import { RouterButton } from '../../components';

/**
 * UserInfo is a component that displays the user's name if user is logged in, or a register and sign in button if not set
 */
const Wrapper = styled.div`
  @media screen and (max-width: ${({ theme }) => theme.breakpoints.values.md}px) {
    display: none;
  }
`;

const UsernameContainer = styled.p<{
  $isLandingPage?: boolean;
}>`
  padding-right: ${({ $isLandingPage }) => ($isLandingPage ? '1.5rem' : '5px')};
  margin: 0;
  font-weight: ${({ $isLandingPage, theme }) =>
    $isLandingPage ? theme.typography.fontWeightMedium : theme.typography.fontWeightRegular};
  font-size: 0.875rem;
  text-transform: ${({ $isLandingPage }) => ($isLandingPage ? 'uppercase' : 'none')};
  @media screen and (max-width: ${({ theme }) => theme.breakpoints.values.md}px) {
    display: none;
  }
`;

const Register = styled(RouterButton).attrs({
  variant: 'text',
})`
  text-transform: none;
  font-size: 0.875rem;
`;

const SignInButton = styled(RouterButton).attrs({
  variant: 'outlined',
  color: 'default',
})<
  LinkProps & {
    $secondaryColor?: string;
  }
>`
  font-size: 0.875rem;
  text-transform: none;
  background: none;
  border: 1px solid ${({ $secondaryColor }) => $secondaryColor};
  border-radius: 18px;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  height: 30px;
  margin-right: 1.7rem;
  padding-left: 1em;
  padding-right: 1em;
`;

interface UserInfoProps {
  currentUserUsername?: string;
  isLandingPage?: boolean;
  secondaryColor?: string;
  isLoggedIn?: boolean;
}

/**
 * This is the username OR user buttons. These are only visible in desktop
 */
export const UserInfo = ({
  currentUserUsername,
  isLandingPage,
  secondaryColor,
  isLoggedIn,
}: UserInfoProps) => {
  if (isLoggedIn)
    return (
      <UsernameContainer $isLandingPage={isLandingPage}>{currentUserUsername}</UsernameContainer>
    );
  return (
    <Wrapper>
      <Register to={USER_ROUTES.REGISTER}>Register</Register>
      <SignInButton to={USER_ROUTES.LOGIN} $secondaryColor={secondaryColor}>
        Log in
      </SignInButton>
    </Wrapper>
  );
};
