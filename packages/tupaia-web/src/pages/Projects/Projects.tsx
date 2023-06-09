/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import ExploreIcon from '@material-ui/icons/ExploreOutlined';
import { Button } from '@tupaia/ui-components';
import { Modal } from '../../components';
import { DEFAULT_URL, TUPAIA_LIGHT_LOGO_SRC } from '../../constants';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2.2rem 4rem;
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
  // TODO: add in navigateBack functionality for onClose once Tom's work is merged in
  return (
    <Modal isOpen={true} onClose={() => {}}>
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
          <ProjectsGrid>Hi</ProjectsGrid>
        </div>
      </Wrapper>
    </Modal>
  );
};
