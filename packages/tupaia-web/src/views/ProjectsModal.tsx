/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { To, useLocation } from 'react-router';
import {
  MODAL_ROUTES,
  DEFAULT_URL,
  PROJECT_ACCESS_TYPES,
  TUPAIA_LIGHT_LOGO_SRC,
  URL_SEARCH_PARAMS,
} from '../constants';
import { useProjects, useUser } from '../api/queries';
import {
  ProjectAllowedLink,
  ProjectCardList,
  ProjectDeniedLink,
  ProjectPendingLink,
} from '../layout';
import { RouterButton } from '../components';
import { CircularProgress } from '@material-ui/core';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 3.125rem;
  padding-right: 3.125rem;
  width: 65rem;
  max-width: 100%;
  text-align: left;
`;

const TagLine = styled.p`
  margin: 0.5rem 0.4rem 1.5rem;
  max-width: 26rem;
  font-size: 0.875rem;
  font-weight: 400;
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin: 1.4rem 0;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ExploreButton = styled(RouterButton).attrs({
  variant: 'outlined',
  color: 'default',
  to: DEFAULT_URL,
})`
  margin-top: 0.3rem;
  margin-bottom: 1rem;
  margin-left: 0.3rem;
  width: 10.5rem;
  height: 2.5rem;
  line-height: 1.125rem;
  border-radius: 3px;
  font-size: 0.875rem;
  font-weight: 500;
  font-style: normal;
  text-align: center;
  text-transform: none;
  border-color: white;
`;

const Line = styled.div`
  background-color: #9ba0a6;
  height: 1px;
  margin-top: 0.7rem;
`;

const ProjectsTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 500;
  color: white;
  margin-top: 1.8rem;
  margin-left: 0.4rem;
`;

const Logo = styled.img`
  width: 6.6875rem;
  height: 2.6875rem;
`;

const Loader = styled.div`
  margin-top: 1.5rem;
  min-height: 15rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

/**
 * This is the projects view that is shown when the projects modal is open
 */
export const ProjectsModal = () => {
  const {
    data: { projects },
    isFetching,
  } = useProjects();
  const { isLoggedIn } = useUser();
  const location = useLocation();
  return (
    <Wrapper>
      <div>
        <Logo src={TUPAIA_LIGHT_LOGO_SRC} alt="Tupaia logo" />
        <TagLine>
          Data aggregation, analysis, and visualisation for the most remote settings in the world.
        </TagLine>
      </div>
      <div>
        <ExploreButton>Explore Tupaia.org</ExploreButton>
        <Line />
        <ProjectsTitle>Projects</ProjectsTitle>
        {isFetching ? (
          <Loader>
            <CircularProgress />
          </Loader>
        ) : (
          <ProjectsGrid>
            <ProjectCardList
              projects={projects}
              actions={{
                [PROJECT_ACCESS_TYPES.ALLOWED]: ({
                  project: { code, homeEntityCode, dashboardGroupName },
                }) => (
                  <ProjectAllowedLink
                    url={`/${code}/${homeEntityCode}${
                      dashboardGroupName ? `/${dashboardGroupName}` : ''
                    }`}
                  />
                ),
                [PROJECT_ACCESS_TYPES.PENDING]: () => <ProjectPendingLink />,
                [PROJECT_ACCESS_TYPES.DENIED]: ({ project: { code } }) => {
                  const LINK = {
                    TEXT: 'Log in',
                    TO: {
                      ...location,
                      hash: MODAL_ROUTES.LOGIN,
                    },
                    STATE: {
                      referrer: location,
                    },
                  } as {
                    TEXT: ReactNode;
                    TO: To;
                    STATE?: Record<string, unknown> | null;
                  };
                  if (isLoggedIn) {
                    LINK.TEXT = 'Request Access';
                    LINK.TO = {
                      ...location,
                      hash: MODAL_ROUTES.REQUEST_PROJECT_ACCESS,
                      search: `${URL_SEARCH_PARAMS.PROJECT}=${code}`,
                    };
                    LINK.STATE = null;
                  }
                  return (
                    <ProjectDeniedLink
                      url={`?${URL_SEARCH_PARAMS.PROJECT}=${code}#${MODAL_ROUTES.REQUEST_PROJECT_ACCESS}`}
                    />
                  );
                },
              }}
            />
          </ProjectsGrid>
        )}
      </div>
    </Wrapper>
  );
};
