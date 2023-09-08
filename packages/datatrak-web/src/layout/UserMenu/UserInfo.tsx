/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { RouterLink } from '@tupaia/ui-components';
import { Button } from '../../components';
import { useProjects, useUser } from '../../api/queries';
import { MOBILE_BREAKPOINT, ROUTES } from '../../constants';
import { ProjectSelectModal } from './ProjectSelectModal';

const Wrapper = styled.div`
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
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
`;

const ProjectButton = styled(Button).attrs({
  variant: 'text',
})`
  color: ${props => props.theme.palette.text.secondary};
  padding-left: 0.5rem;
  padding-right: 0.5rem;

  &:hover {
    color: #2a78c3;
    text-decoration: underline;
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

const useData = () => {
  const { data: projects } = useProjects();
  const { data: user, isLoggedIn } = useUser();
  const userProject = projects?.find(({ id }) => id === user?.projectId);
  return { isLoggedIn, user: { ...user, project: userProject } };
};

/**
 * This is the displayed user name OR the login/register buttons on desktop
 */
export const UserInfo = () => {
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const { isLoggedIn, user } = useData();
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
            <Typography>{user.name}</Typography>
            <span>|</span>
            <ProjectButton onClick={openProjectModal} tooltip="Change project">
              {user.project?.entityName}
            </ProjectButton>
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
      <ProjectSelectModal
        open={projectModalOpen}
        onClose={closeProjectModal}
        projectId={user.projectId}
      />
    </>
  );
};
