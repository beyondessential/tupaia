/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import { EnvBanner } from '@tupaia/ui-components';
import OverlayDiv from '../../containers/OverlayDiv';
import { SingleProjectLandingPage } from './SingleProjectLandingPage';
import { MultiProjectLandingPage } from './MultiProjectLandingPage';
import TopBar from '../../containers/TopBar';
import { TOP_BAR_HEIGHT, TOP_BAR_HEIGHT_MOBILE } from '../../styles';
import { LandingPageFooter } from './LandingPageFooter';
import { useCustomLandingPages } from './useCustomLandingPages';
import { LoadingScreen } from '../LoadingScreen';

/**
 * This is the template for landing pages when the user is not on a mobile device
 */

const Wrapper = styled.div`
  position: relative;
  background-size: cover;
  background-position: center;
  background-color: #262834;
  background-image: ${({ backgroundImage }) =>
    backgroundImage ? `url(${backgroundImage})` : 'none'};
`;

const Container = styled(MuiContainer)`
  background: linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.7) 100%);
  padding: 1em;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: calc(100vh - ${TOP_BAR_HEIGHT_MOBILE}px);
  overflow-y: auto;
  @media screen and (min-width: ${({ theme }) =>
      theme.breakpoints.values.sm}px) and (min-height: 600px) {
    padding: 2em 3.5em;
    min-height: calc(100vh - ${TOP_BAR_HEIGHT}px);
  }
`;

export const LandingPage = () => {
  const { customLandingPageSettings, projects } = useCustomLandingPages();
  const { imageUrl: backgroundImage } = customLandingPageSettings;

  return (
    <>
      <EnvBanner />
      <TopBar />
      <Wrapper backgroundImage={backgroundImage}>
        <Container maxWidth={false}>
          {/* tupaia requires projects to work so we can assume that if there are no projects, it's just */}
          {/* because they haven't loaded yet. We can replace this with more idiomatic loading state */}
          {/* when we refactor to use react-query */}
          {projects.length === 0 && <LoadingScreen isLoading background={null} />}
          {projects.length === 1 && <SingleProjectLandingPage />}
          {projects.length > 1 && <MultiProjectLandingPage />}
          <LandingPageFooter />
        </Container>
      </Wrapper>
      {/* Include the OverlayDiv so that the login and logout functionality is available on the */}
      {/* custom landing pages */}
      <OverlayDiv />
    </>
  );
};
