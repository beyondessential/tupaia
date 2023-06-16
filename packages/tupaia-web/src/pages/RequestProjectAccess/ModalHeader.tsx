/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import ExploreIcon from '@material-ui/icons/ExploreOutlined';
import { MODAL_ROUTES, PROJECT_PARAM, TUPAIA_LIGHT_LOGO_SRC } from '../../constants';
import { RouterButton } from '../../components';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  & + & {
    margin-left: 2rem;
  }
`;

const TagLine = styled.p`
  text-align: left;
  font-size: 0.75rem;
`;

const Logo = styled.img`
  max-width: 6.5rem;
`;

const ProjectsButton = styled(RouterButton).attrs({
  variant: 'outlined',
  color: 'default',
})`
  margin-bottom: 1rem;
  width: 14rem;
  height: 3.1rem;
  border-radius: 3px;
  font-size: 0.8rem;

  svg {
    margin-right: 0.625rem;
  }
`;

export const ModalHeader = () => {
  const [urlParams] = useSearchParams();
  const remainingParams = [...urlParams.entries()].filter(e => e[0] !== PROJECT_PARAM);
  const newUrlParams = new URLSearchParams(remainingParams);
  const projectsUrl = `${MODAL_ROUTES.PROJECTS}${
    remainingParams.length ? `?${newUrlParams.toString()}` : ''
  }`;

  return (
    <Header>
      <HeaderContainer>
        <Logo src={TUPAIA_LIGHT_LOGO_SRC} alt="Tupaia logo" />
        <TagLine>
          Data aggregation, analysis, and visualisation for the most remote settings in the world
        </TagLine>
      </HeaderContainer>
      <HeaderContainer>
        <ProjectsButton to={projectsUrl}>
          <ExploreIcon />
          View other projects
        </ProjectsButton>
      </HeaderContainer>
    </Header>
  );
};
