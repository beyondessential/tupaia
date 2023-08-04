import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import ExploreIcon from '@material-ui/icons/ExploreOutlined';
import LeftArrow from '@material-ui/icons/KeyboardBackspace';
import { FluTrackingAustralia, ArmedIncidentManagement } from './ProjectContents';
import { LoadingIndicator } from '../../../Form/common';

import { TUPAIA_LIGHT_LOGO_SRC } from '../../../../constants';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 32px;
  text-align: left;
`;

const Logo = styled.img`
  width: 106px;
  height: 46px;
`;

const TagLine = styled.p`
  margin: 8px;
  width: 206px;
  font-size: 12px;
`;

const ExploreButton = styled(Button)`
  margin-bottom: 16px;
  width: 225px;
  height: 50px;
  border-radius: 3px;
  font-size: 12px;

  svg {
    margin-right: 10px;
  }
`;

const BackButton = styled(Button)`
  width: 100%;
  border-radius: 0;
  justify-content: flex-start;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 16px 32px;
  font-weight: 400;
  font-size: 12px;
`;

const Countries = styled.div`
  margin-bottom: 8px;
  font-size: 14px;
  opacity: 0.7;
  padding: 0;
`;

const ProjectHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 18px 32px;
  text-align: left;

  h2 {
    margin: 0 0 12px 0;
    max-width: 300px;
  }
`;

const ViewProjectButton = styled(Button)`
  background: #2196f3;
  width: 174px;
  height: 45px;
  border-radius: 3px;
  font-size: 12px;
  align-self: center;
`;

const ProjectBody = styled.div`
  padding: 0 32px 18px 32px;
  text-align: left;
  max-width: 592px;
`;

const HeroImage = styled.div`
  width: 100%;
  height: 240px;
  background-image: ${({ src }) => `url(${src})`};
  position: relative;
  background-size: cover;
`;

const LogoImage = styled.div`
  width: 130px;
  height: 75px;
  background: #ffffff;
  background-image: ${({ src }) => `url(${src})`};
  background-repeat: no-repeat;
  background-position: center;
  position: absolute;
  top: -36px;
  right: 36px;
`;

export const ProjectLandingPage = ({
  closeOverlay,
  selectExplore,
  viewProjects,
  project,
  scrollToTop,
}) => {
  useEffect(() => scrollToTop(), []);
  if (!project.code) return <LoadingIndicator />;

  const components = {
    aim_demo: () => <ArmedIncidentManagement />,
    covidau: () => <FluTrackingAustralia />,
  };
  const ProjectContent = components[project.code];

  return (
    <>
      <Header>
        <div>
          <Logo src={TUPAIA_LIGHT_LOGO_SRC} alt="Tupaia logo" />
          <TagLine>
            Data aggregation, analysis, and visualisation for the most remote settings in the world
          </TagLine>
        </div>
        <ExploreButton onClick={selectExplore} variant="outlined">
          <ExploreIcon />
          &nbsp; I just want to explore
        </ExploreButton>
      </Header>
      <BackButton onClick={viewProjects}>
        {' '}
        <LeftArrow />
        &nbsp; Back to projects
      </BackButton>
      <HeroImage src={project.imageUrl}>
        <LogoImage src={project.logoUrl} />
      </HeroImage>
      <ProjectHeader>
        <div>
          <h2>{project.name}</h2>
          <Countries>{project.names.join(', ')}</Countries>
        </div>
        <ViewProjectButton onClick={closeOverlay} color="primary" variant="contained">
          View project
        </ViewProjectButton>
      </ProjectHeader>
      <ProjectBody>
        <ProjectContent />
      </ProjectBody>
    </>
  );
};

ProjectLandingPage.propTypes = {
  selectExplore: PropTypes.func.isRequired,
  viewProjects: PropTypes.func.isRequired,
  scrollToTop: PropTypes.func.isRequired,
  closeOverlay: PropTypes.func.isRequired,
  project: PropTypes.shape({
    name: PropTypes.string,
    longDescription: PropTypes.string,
    names: PropTypes.array,
    logoUrl: PropTypes.string,
    imageUrl: PropTypes.string,
    code: PropTypes.string,
  }).isRequired,
};
