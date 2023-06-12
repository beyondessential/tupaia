/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import ExploreIcon from '@material-ui/icons/ExploreOutlined';
import { Button } from '@tupaia/ui-components';
import { DEFAULT_URL, PROJECT_ACCESS_TYPES, TUPAIA_LIGHT_LOGO_SRC } from '../../constants';
import { useProjects, useUser } from '../../api/queries';
import { USER_ROUTES } from '../../Routes';
import {
  LegacyProjectCard,
  LegacyProjectAllowedLink,
  LegacyProjectDeniedLink,
  LegacyProjectPendingLink,
  ProjectCardList,
} from '../../layout';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.2rem 2rem 0;
  width: 100%;
  max-width: 920px;
`;

const TagLine = styled.p`
  margin: 0.625rem 0 2.5rem;
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin: 24px 0;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ExploreButton = styled(Button).attrs({
  component: Link,
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

export const Projects = () => {
  const {
    data: { projects },
  } = useProjects();
  const { isLoggedIn } = useUser();
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
        <ProjectsGrid>
          <ProjectCardList
            projects={projects}
            ProjectCard={LegacyProjectCard}
            actions={{
              [PROJECT_ACCESS_TYPES.ALLOWED]: ({
                project: { code, homeEntityCode, defaultDashboardCode },
              }) => (
                <LegacyProjectAllowedLink
                  url={`/${code}/${homeEntityCode}${
                    defaultDashboardCode ? `/${defaultDashboardCode}` : ''
                  }`}
                />
              ),
              [PROJECT_ACCESS_TYPES.PENDING]: () => <LegacyProjectPendingLink />,
              [PROJECT_ACCESS_TYPES.DENIED]: ({ project: { code } }) => {
                const LINK = {
                  TEXT: 'Log in',
                  URL: USER_ROUTES.LOGIN,
                };
                if (isLoggedIn) {
                  LINK.TEXT = 'Request Access';
                  LINK.URL = `/${USER_ROUTES.REQUEST_ACCESS}/${code}`;
                }
                return (
                  <LegacyProjectDeniedLink url={LINK.URL}>{LINK.TEXT}</LegacyProjectDeniedLink>
                );
              },
            }}
          />
        </ProjectsGrid>
      </div>
    </Wrapper>
  );
};
