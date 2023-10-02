/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { RouterLink } from '@tupaia/ui-components';
import { Button } from '../../components';
import { useUser } from '../../api/queries';
import { ROUTES } from '../../constants';
import { ProjectSelectModal } from './ProjectSelectModal';

const Wrapper = styled.div`
  padding-left: 1.5rem;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;

  > span {
    color: ${props => props.theme.palette.text.primary};
    position: relative;
    top: -1px;
    font-size: 1.2em;
    margin-left: 0.5rem;
  }
  ${({ theme }) => theme.breakpoints.up('md')} {
    flex-direction: row;
    align-items: center;
  }
`;

const ProjectButton = styled(Button).attrs({
  variant: 'text',
})`
  padding: 0;
  justify-content: flex-start;
  .MuiButton-label {
    line-height: 1;
    font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
  }
  color: ${props => props.theme.palette.text.secondary};
  &:hover {
    color: ${props => props.theme.palette.action.hover};
    text-decoration: underline;
  }
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    justify-content: center;
    &:before {
      content: '';
      border-left: 1px solid ${props => props.theme.palette.text.secondary};
      height: 1.2rem;
    }
    .MuiButton-label {
      padding-left: 0.5rem;
      line-height: 1.4;
      font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
    }
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
  ${({ theme }) => theme.breakpoints.down('md')} {
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  }
`;

/**
 * This is the displayed user name OR the login/register buttons on desktop
 */
export const UserInfo = () => {
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const { isLoggedIn, data: user } = useUser();
  const openProjectModal = () => {
    setProjectModalOpen(true);
  };

  const closeProjectModal = () => {
    setProjectModalOpen(false);
  };

  return (
    <>
      <Wrapper>
        {isLoggedIn ? (
          <Details>
            <UserName>{user.name}</UserName>
            {user?.projectId && (
              <ProjectButton onClick={openProjectModal} tooltip="Change project">
                {user.project?.name}
              </ProjectButton>
            )}
          </Details>
        ) : (
          <>
            <AuthLink variant="text" to={ROUTES.REGISTER}>
              Register
            </AuthLink>
            <LoginLink to={ROUTES.LOGIN}>Login</LoginLink>
          </>
        )}
      </Wrapper>
      {/*Open prop?*/}
      {projectModalOpen && (
        <ProjectSelectModal open onClose={closeProjectModal} projectId={user.projectId} />
      )}
    </>
  );
};
