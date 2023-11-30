/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { RouterLink } from '@tupaia/ui-components';
import { Button } from '../../components';
import { useCurrentUser } from '../../api';
import { ROUTES } from '../../constants';

const Wrapper = styled.div`
  padding-left: 1rem;
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding-left: 1.5rem;
  }
`;

const Details = styled.div`
  display: flex;
  align-items: center;
  > span {
    color: ${props => props.theme.palette.text.primary};
    position: relative;
    top: -1px;
    font-size: 1.2em;
    margin-left: 0.5rem;
  }
  ${({ theme }) => theme.breakpoints.down('sm')} {
    display: none;
  }
`;

const ProjectButton = styled(Button).attrs({
  variant: 'text',
})`
  margin-left: 0.5rem;
  padding-left: 0;
  padding-right: 0.5rem;
  justify-content: center;
  .MuiButton-label {
    padding-left: 0.5rem;
    font-size: 1rem;
    line-height: 1.4;
    font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
  }
  color: ${props => props.theme.palette.text.secondary};
  &:hover {
    background: none;
    color: ${props => props.theme.palette.action.hover};
    text-decoration: underline;
  }

  &:before {
    content: '';
    border-left: 1px solid ${props => props.theme.palette.text.secondary};
    height: 1.2rem;
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
  border-color: ${props => props.theme.palette.text.primary};
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
export const UserInfo = ({ openProjectModal }: { openProjectModal: () => void }) => {
  const user = useCurrentUser();

  return (
    <Wrapper>
      {user.isLoggedIn ? (
        <Details>
          <UserName>{user.userName}</UserName>
          {user.projectId && (
            <ProjectButton onClick={openProjectModal} tooltip="Change project">
              {user.project?.name}
            </ProjectButton>
          )}
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
