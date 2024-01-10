/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Box, Typography } from '@material-ui/core';
import { RouterLink } from '@tupaia/ui-components';
import { Button, ChangeProjectButton } from '../../components';
import { useCurrentUser } from '../../api';
import { ROUTES } from '../../constants';

const Wrapper = styled(Box)`
  padding-inline-start: 1rem;
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding-inline-start: 1.5rem;
  }
`;

const Details = styled(Box)`
  align-items: baseline;
  display: flex;
  font-size: 1rem;
  line-height: 1.2;
  gap: 0.5rem;

  ${({ theme }) => theme.breakpoints.down('sm')} {
    display: none;
  }
`;

const AuthLink = styled(Button).attrs({
  color: 'default',
  component: RouterLink,
})``;

const LoginLink = styled(AuthLink).attrs({
  variant: 'outlined',
})`
  border-radius: 4rem;
  border-color: ${({ theme }) => theme.palette.text.primary};
`;

const UserName = styled(Typography)`
  ${({ theme }) => theme.breakpoints.down('sm')} {
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  }
`;

const AuthButtons = styled(Box)`
  ${({ theme }) => theme.breakpoints.down('sm')} {
    display: none;
  }
`;

/**
 * This is the displayed user name OR the login/register buttons on desktop
 */
export const UserInfo = () => {
  const { isLoggedIn, projectId, userName } = useCurrentUser();

  const StyledProjectButton = styled(ChangeProjectButton)`
    border-inline-start: 1px solid ${({ theme }) => theme.palette.text.secondary};
    padding-inline-start: 0.5rem;
  `;

  return (
    <Wrapper>
      {isLoggedIn ? (
        <Details>
          <UserName>{userName}</UserName>
          {projectId && <StyledProjectButton />}
        </Details>
      ) : (
        <AuthButtons>
          <AuthLink variant="text" to={ROUTES.REGISTER}>
            Register
          </AuthLink>
          <LoginLink to={ROUTES.LOGIN}>Log in</LoginLink>
        </AuthButtons>
      )}
    </Wrapper>
  );
};
