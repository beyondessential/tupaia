import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { RouterLink } from '@tupaia/ui-components';
import { Button, ChangeProjectButton } from '../../components';
import { useCurrentUserContext } from '../../api';
import { ROUTES } from '../../constants';

const Wrapper = styled.div`
  padding-inline-start: 1rem;
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding-inline-start: 1.5rem;
  }
`;

export const UserDetails = styled.div`
  align-items: baseline;
  display: flex;
  font-size: 1.2em;
  gap: 0.5rem;
  padding-inline: 0.5rem;
  > span {
    color: ${props => props.theme.palette.text.primary};
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

const AuthButtons = styled.div`
  ${({ theme }) => theme.breakpoints.down('sm')} {
    display: none;
  }
`;

/**
 * This is the displayed user name OR the login/register buttons on desktop
 */
export const UserInfo = () => {
  const { isLoggedIn, projectId, fullName } = useCurrentUserContext();

  return (
    <Wrapper>
      {isLoggedIn ? (
        <UserDetails>
          <UserName>{fullName}</UserName>
          {projectId && <ChangeProjectButton leadingBorder />}
        </UserDetails>
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
