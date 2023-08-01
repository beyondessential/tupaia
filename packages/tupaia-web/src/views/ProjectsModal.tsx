/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { To, useLocation } from 'react-router';
import ExploreIcon from '@material-ui/icons/ExploreOutlined';
import {
  MODAL_ROUTES,
  DEFAULT_URL,
  PROJECT_ACCESS_TYPES,
  TUPAIA_LIGHT_LOGO_SRC,
  URL_SEARCH_PARAMS,
} from '../constants';
import { useProjects, useUser } from '../api/queries';
import {
  LegacyProjectCard,
  LegacyProjectAllowedLink,
  LegacyProjectDeniedLink,
  LegacyProjectPendingLink,
  ProjectCardList,
} from '../layout';
import { RouterButton } from '../components';
import { CircularProgress } from '@material-ui/core';
import { ErrorBoundary } from '../../../ui-components/src/components/ErrorBoundary';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.2rem 0 0;
  width: 54rem;
  max-width: 100%;
`;

const TagLine = styled.p`
  margin: 0.625rem 0 2.5rem;
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 1.5rem 0;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ExploreButton = styled(RouterButton).attrs({
  variant: 'outlined',
  color: 'default',
  to: DEFAULT_URL,
})`
  margin-bottom: 16px;
  width: 250px;
  height: 50px;
  border-radius: 3px;
  font-size: 13px;

  svg {
    margin-right: 10px;
  }
`;

const Logo = styled.img`
  width: 200px;
  height: 85px;
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
          Data aggregation, analysis, and visualisation for the most remote settings in the world
        </TagLine>
      </div>
      <div>
        <ExploreButton>
          <ExploreIcon />I just want to explore
        </ExploreButton>
        <ErrorBoundary>
          {isFetching ? (
            <Loader>
              <CircularProgress />
            </Loader>
          ) : (
            <ProjectsGrid>
              <ProjectCardList
                projects={projects}
                ProjectCard={LegacyProjectCard}
                actions={{
                  [PROJECT_ACCESS_TYPES.ALLOWED]: ({
                    project: { code, homeEntityCode, dashboardGroupName },
                  }) => (
                    <LegacyProjectAllowedLink
                      to={`/${code}/${homeEntityCode}${
                        dashboardGroupName ? `/${dashboardGroupName}` : ''
                      }`}
                    />
                  ),
                  [PROJECT_ACCESS_TYPES.PENDING]: () => <LegacyProjectPendingLink />,
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
                      <LegacyProjectDeniedLink to={LINK.TO} routerState={LINK.STATE}>
                        {LINK.TEXT}
                      </LegacyProjectDeniedLink>
                    );
                  },
                }}
              />
            </ProjectsGrid>
          )}
        </ErrorBoundary>
      </div>
    </Wrapper>
  );
};
