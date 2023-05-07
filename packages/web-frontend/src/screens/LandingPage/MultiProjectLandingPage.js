import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { ProjectCardList } from '../../containers/OverlayDiv/components/ProjectPage/ProjectCardList';
import { PROJECT_ACCESS_TYPES } from '../../constants';
import { useNavigation } from './useNavigation';
import { useCustomLandingPages } from './useCustomLandingPages';
import { useAuth } from './useAuth';

const ProjectsWrapper = styled.div`
  width: 100%;
  max-width: ${({ theme }) => theme.breakpoints.values.lg}px;
  margin: 0 auto;
`;

const ProjectsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 1.2rem;
  row-gap: 1.2rem;
  > div {
    border: 1.6rem solid ${props => props.primaryColor};
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
    column-gap: 3.2rem;
    row-gap: 3.2rem;
  }
`;

const Title = styled(Typography)`
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  font-size: 2rem;
  line-height: 3rem;
  margin-bottom: 1.8rem;
  color: ${({ theme }) => theme.palette.common.white};
  text-shadow: 1px 1px #333;
  max-width: 480px;
`;

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export function MultiProjectLandingPage() {
  const { navigateToProject, navigateToRequestProjectAccess, navigateToLogin } = useNavigation();
  const {
    projects,
    customLandingPageSettings: {
      include_name_in_header: includeNameInHeader,
      primary_hexcode: primaryColor,
    },
  } = useCustomLandingPages();
  const { isUserLoggedIn } = useAuth();
  return (
    <Wrapper>
      <Title variant={includeNameInHeader ? 'h2' : 'h1'}>Select a project below to view.</Title>
      <ProjectsWrapper>
        <ProjectsContainer primaryColor={primaryColor}>
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
        </ProjectsContainer>
      </ProjectsWrapper>
    </Wrapper>
  );
}
