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
import { TOP_BAR_HEIGHT, TOP_BAR_HEIGHT_MOBILE } from '../../styles';
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
`;

const Container = styled(MuiContainer)`
  background: linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.7) 100%);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: calc(100vh - ${TOP_BAR_HEIGHT_MOBILE}px);
  overflow-y: auto;
  @media screen and (min-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    padding: 3.5rem;
    height: calc(100vh - ${TOP_BAR_HEIGHT}px);
  }
`;

export const LandingPage = () => {
  const { projects, customLandingPageSettings } = useCustomLandingPages();
  const { image_url: backgroundImage } = customLandingPageSettings;

  return (
    <>
      <EnvBanner />
      <TopBar />
      <Wrapper backgroundImage={backgroundImage}>
        <Container maxWidth={false}>
          {projects.length > 1 ? <MultiProjectLandingPage /> : <SingleProjectLandingPage />}
          <LandingPageFooter />
        </Container>
      </Wrapper>
      {/* Include the OverlayDiv so that the login and logout functionality is available on the */}
      {/* custom landing pages */}
      <OverlayDiv />
    </>
  );
};
