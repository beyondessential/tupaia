/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import OverlayDiv from '../../containers/OverlayDiv';
import { useCustomLandingPages } from './useCustomLandingPages';
import { SingleProjectLandingPage } from './SingleProjectLandingPage';
import { MultiProjectLandingPage } from './MultiProjectLandingPage';

const Wrapper = styled.div`
  position: relative;
  background-size: cover;
  background-position: center;
  background-color: #000000;
  background-image: ${({ backgroundImage }) =>
    backgroundImage ? `url(${backgroundImage})` : 'none'};
`;

const Container = styled(MuiContainer)`
  position: relative;
  min-height: calc(100vh - 75px);
  background: linear-gradient(rgba(0, 0, 0, 0.1) 35%, rgba(0, 0, 0, 0.7) 100%);
  padding: 3.5rem;
`;

const Footer = styled.div`
  position: absolute;
  bottom: 0;
  left: 50px;
  right: 50px;
  border-top: 1px solid white;
  height: 75px;
`;

export const LandingPage = () => {
  const { projects, customLandingPageSettings } = useCustomLandingPages();
  const { image_url: backgroundImage } = customLandingPageSettings;

  return (
    <>
      <Wrapper backgroundImage={backgroundImage}>
        <Container maxWidth={false}>
          {projects.length > 1 ? <MultiProjectLandingPage /> : <SingleProjectLandingPage />}
          <Footer />
        </Container>
      </Wrapper>
      {/* Include the OverlayDiv so that the login and logout functionality is available on the */}
      {/* custom landing pages */}
      <OverlayDiv />
    </>
  );
};
