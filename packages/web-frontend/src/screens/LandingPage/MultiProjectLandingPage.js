import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { ProjectCardList } from '../../containers/OverlayDiv/components/ProjectPage/ProjectCardList';
import { PROJECT_ACCESS_TYPES } from '../../constants';
import { useNavigation } from './useNavigation';
import { useCustomLandingPages } from './useCustomLandingPages';
import { useAuth } from './useAuth';

const Projects = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 50px;
  margin: 0 auto;
  max-width: 1200px;
  padding-top: 10%;
`;

const Title = styled(Typography)`
  font-style: normal;
  font-weight: 600;
  font-size: 2rem;
  line-height: 3rem;
  margin-bottom: 1.8rem;
  color: white;
  text-shadow: 1px 1px #333;
  max-width: 480px;
`;
export function MultiProjectLandingPage() {
  const { navigateToProject, navigateToRequestProjectAccess, navigateToLogin } = useNavigation();
  const { projects } = useCustomLandingPages();
  const { isUserLoggedIn } = useAuth();
  return (
    <Projects>
      <Title variant="h1">Select a project below to view.</Title>
      <ProjectCardList
        projects={projects}
        actions={{
          [PROJECT_ACCESS_TYPES.ALLOWED]: navigateToProject,
          [PROJECT_ACCESS_TYPES.PENDING]: navigateToRequestProjectAccess,
          [PROJECT_ACCESS_TYPES.DENIED]: isUserLoggedIn
            ? navigateToRequestProjectAccess
            : navigateToLogin,
        }}
        isUserLoggedIn={isUserLoggedIn}
      />
    </Projects>
  );
}
