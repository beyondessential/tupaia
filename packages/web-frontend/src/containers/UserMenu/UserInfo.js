/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button } from '@material-ui/core';

/**
 * UserInfo is a component that displays the user's name if user is logged in, or a register and sign in button if not set
 */
const UsernameContainer = styled.p`
  padding-right: 5px;
  margin: 0;
  font-weight: ${({ isCustomLandingPage, theme }) =>
    isCustomLandingPage ? theme.typography.fontWeightMedium : theme.typography.fontWeightRegular};
  font-size: 0.875rem;
  text-transform: ${({ isCustomLandingPage }) => (isCustomLandingPage ? 'uppercase' : 'none')};
`;

const RegisterButton = styled(Button)`
  text-transform: none;
  margin-right: 0.5em;
`;

const SignInButton = styled(Button)`
  text-transform: none;
  border: 1px solid ${props => props.secondaryColor};
  border-radius: 18px;
  font-weight: ${props => props.theme.typography.fontWeightMedium};
  height: 30px;
  margin-right: 0.5em;
  padding-left: 1em;
  padding-right: 1em;
`;

export const UserInfo = ({
  currentUserUsername,
  onClickRegister,
  signInText,
  onClickSignIn,
  isCustomLandingPage,
  secondaryColor,
  showRegisterButton,
}) => {
  if (currentUserUsername)
    return (
      <UsernameContainer isCustomLandingPage={isCustomLandingPage}>
        {currentUserUsername}
      </UsernameContainer>
    );
  return (
    <>
      {showRegisterButton && <RegisterButton onClick={onClickRegister}>Register</RegisterButton>}
      <SignInButton onClick={onClickSignIn} secondaryColor={secondaryColor}>
        {signInText}
      </SignInButton>
    </>
  );
};

UserInfo.propTypes = {
  currentUserUsername: PropTypes.string,
  onClickRegister: PropTypes.func.isRequired,
  signInText: PropTypes.string,
  onClickSignIn: PropTypes.func.isRequired,
  isCustomLandingPage: PropTypes.bool,
  secondaryColor: PropTypes.string.isRequired,
  showRegisterButton: PropTypes.bool,
};

UserInfo.defaultProps = {
  currentUserUsername: null,
  showRegisterButton: false,
  signInText: 'Sign in',
  isCustomLandingPage: false,
};
