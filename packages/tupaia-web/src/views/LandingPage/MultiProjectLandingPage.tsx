/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { URL_SEARCH_PARAMS, TRANSPARENT_BLACK } from '../../constants';
import { SingleLandingPage } from '../../types';
import { PROJECT_ACCESS_TYPES, MODAL_ROUTES } from '../../constants';
import {
  ProjectCardList,
  ProjectLoginLink,
  ProjectDeniedLink,
  ProjectAllowedLink,
  ProjectPendingLink,
} from '../../layout';

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
    grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
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
  text-shadow: 1px 1px ${TRANSPARENT_BLACK};
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

interface MultiProjectLandingPageProps
  extends Pick<SingleLandingPage, 'projects' | 'includeNameInHeader'> {
  isLoggedIn: boolean;
}

export function MultiProjectLandingPage({
  isLoggedIn,
  projects,
  includeNameInHeader,
}: MultiProjectLandingPageProps) {
  return (
    <Wrapper>
      <Title variant={includeNameInHeader ? 'h2' : 'h1'}>Select a project below to view.</Title>
      <ProjectsWrapper>
        <ProjectsContainer>
          <ProjectCardList
            projects={projects}
            actions={{
              [PROJECT_ACCESS_TYPES.ALLOWED]: ({
                project: { id, code, homeEntityCode, dashboardGroupName },
              }) => (
                <ProjectAllowedLink
                  projectId={id}
                  url={`/${code}/${homeEntityCode}${
                    dashboardGroupName ? `/${encodeURIComponent(dashboardGroupName)}` : ''
                  }`}
                  isLandingPage
                />
              ),
              [PROJECT_ACCESS_TYPES.PENDING]: () => <ProjectPendingLink />,
              [PROJECT_ACCESS_TYPES.DENIED]: ({ project: { code } }) => {
                if (isLoggedIn) {
                  return (
                    <ProjectDeniedLink
                      url={`?${URL_SEARCH_PARAMS.PROJECT}=${code}#${MODAL_ROUTES.REQUEST_PROJECT_ACCESS}`}
                      isLandingPage
                    />
                  );
                }
                return <ProjectLoginLink />;
              },
            }}
          />
        </ProjectsContainer>
      </ProjectsWrapper>
    </Wrapper>
  );
}
