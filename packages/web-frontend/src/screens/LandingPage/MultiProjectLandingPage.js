import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { ProjectCardList } from '../../containers/OverlayDiv/components/ProjectPage/ProjectCardList';
import {
  ProjectAllowedButton,
  ProjectDeniedButton,
  ProjectLoginButton,
  ProjectPendingButton,
} from '../../containers/OverlayDiv/components/ProjectPage/ProjectCard';
import { PROJECT_ACCESS_TYPES } from '../../constants';
import { useNavigation } from './useNavigation';
import { useCustomLandingPages } from './useCustomLandingPages';
import { useAuth } from './useAuth';
import { TRANS_BLACK } from '../../styles';

const ProjectsWrapper = styled.div`
  width: 100%;
  max-width: ${({ theme }) => theme.breakpoints.values.lg}px;
  margin: 0 auto;
`;

const ProjectsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 1.2em;
  row-gap: 1.2em;

  @media (min-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    grid-template-columns: repeat(auto-fill, minmax(18em, 1fr));
    column-gap: 3.2em;
    row-gap: 3.2em;
  }
`;

const Title = styled(Typography)`
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  font-size: 1.5em;
  line-height: 1.4;
  margin-bottom: 1.2em;
  color: ${({ theme }) => theme.palette.common.white};
  text-shadow: 1px 1px ${TRANS_BLACK};
  max-width: 30em;
  @media screen and (min-width: ${({ theme }) =>
      theme.breakpoints.values.sm}px) and (min-height: 600px) {
    font-size: 2em;
  }
  @media screen and (min-width: ${({ theme }) =>
      theme.breakpoints.values.lg}px) and (min-height: 800px) {
    margin-bottom: 1.8em;
  }
`;

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 2em;
  @media (min-width: ${({ theme }) => theme.breakpoints.values.lg}px) {
    margin-top: 2em;
  }
`;

export function MultiProjectLandingPage() {
  const { navigateToProject, navigateToRequestProjectAccess, navigateToLogin } = useNavigation();
  const {
    projects,
    customLandingPageSettings: { includeNameInHeader, primaryHexcode },
  } = useCustomLandingPages();

  const { isUserLoggedIn } = useAuth();

  return (
    <Wrapper>
      <Title variant={includeNameInHeader ? 'h2' : 'h1'}>Select a project below to view.</Title>
      <ProjectsWrapper>
        <ProjectsContainer primaryColor={primaryHexcode}>
          <ProjectCardList
            projects={projects}
            actions={{
              [PROJECT_ACCESS_TYPES.ALLOWED]: ({ project }) => (
                <ProjectAllowedButton onClick={() => navigateToProject(project)} />
              ),
              [PROJECT_ACCESS_TYPES.PENDING]: ({ project }) => (
                <ProjectPendingButton onClick={() => navigateToRequestProjectAccess(project)} />
              ),
              [PROJECT_ACCESS_TYPES.DENIED]: ({ project }) => {
                if (isUserLoggedIn) {
                  return (
                    <ProjectDeniedButton onClick={() => navigateToRequestProjectAccess(project)} />
                  );
                }
                return <ProjectLoginButton onClick={navigateToLogin} />;
              },
            }}
          />
        </ProjectsContainer>
      </ProjectsWrapper>
    </Wrapper>
  );
}
