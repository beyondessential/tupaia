/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import { EnvBanner } from '@tupaia/ui-components';
import OverlayDiv from '../../containers/OverlayDiv';
import { useCustomLandingPages } from './useCustomLandingPages';
import { SingleProjectLandingPage } from './SingleProjectLandingPage';
import { MultiProjectLandingPage } from './MultiProjectLandingPage';
import TopBar from '../../containers/TopBar';
import { TOP_BAR_HEIGHT } from '../../styles';
import { LandingPageFooter } from './LandingPageFooter';

/**
 * This is the template for landing pages when the user is not on a mobile device
 */

const Wrapper = styled.div`
  position: relative;
  background-size: cover;
  background-position: center;
  background-color: #000000;
  background-image: ${({ backgroundImage }) =>
    backgroundImage ? `url(${backgroundImage})` : 'none'};
  display: flex;
  flex-direction: column;
`;

const Container = styled(MuiContainer)`
  background: linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.7) 100%);
  padding: 3.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: calc(100vh - ${TOP_BAR_HEIGHT}px);
  overflow-y: auto;
`;

const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 80%;
`;

export const LandingPageDesktop = () => {
  const {
    projects,
    customLandingPageSettings: { image_url: backgroundImage },
  } = useCustomLandingPages();

  return (
    <>
      <Wrapper backgroundImage={backgroundImage}>
        <EnvBanner />
        <TopBar />
        <Container maxWidth={false}>
          <ContentWrapper>
            {projects.length > 1 ? <MultiProjectLandingPage /> : <SingleProjectLandingPage />}
          </ContentWrapper>
          <LandingPageFooter />
        </Container>
      </Wrapper>
      {/* Include the OverlayDiv so that the login and logout functionality is available on the */}
      {/* custom landing pages */}
      <OverlayDiv />
    </>
  );
};
