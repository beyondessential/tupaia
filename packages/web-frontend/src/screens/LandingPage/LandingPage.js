/*
 * This is just a place holder Landing Page template. The actual landing page template will be
 * developed in another ticket. @see waitp-1189
 */

import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import OverlayDiv from '../../containers/OverlayDiv';
import { useAuth } from './useAuth';
import { useNavigation } from './useNavigation';
import { ProjectCardList } from '../../containers/OverlayDiv/components/ProjectPage/ProjectCardList';
import { useCustomLandingPages } from './useCustomLandingPages';
import { DARKEST_GREY, WHITE } from '../../styles';
import {
  ALLOWED_PROJECT_ACCESS_TYPE,
  DENIED_PROJECT_ACCESS_TYPE,
  PENDING_PROJECT_ACCESS_TYPE,
} from '../../constants';
import { SingleProjectLandingPage } from './SingleProjectLandingPage';
import { MultiProjectLandingPage } from './MultiProjectLandingPage';
import UserMenu from '../../containers/UserMenu';
import UserBar from '../../containers/UserBar';
import TopBar from '../../containers/TopBar';

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

// const Title = styled(Typography)`
//   font-style: normal;
//   font-weight: 600;
//   font-size: 2rem;
//   line-height: 3rem;
//   margin-bottom: 1.8rem;
//   color: white;
//   text-shadow: 1px 1px #333;
//   max-width: 480px;
// `;

// const Footer = styled.div`
//   position: absolute;
//   bottom: 0;
//   left: 50px;
//   right: 50px;
//   border-top: 1px solid white;
//   height: 75px;
// `;

export const LandingPage = () => {
  const { projects, customLandingPageSettings } = useCustomLandingPages();
  const {
    image_url: backgroundImage,
    logo_url: logoImage,
    primary_hexcode: primaryColor = DARKEST_GREY,
    secondary_hexcode: secondaryColor = WHITE,
  } = customLandingPageSettings;

  return (
    <>
      <Wrapper backgroundImage={backgroundImage}>
        <Container maxWidth={false}>
          {projects.length > 1 ? <MultiProjectLandingPage /> : <SingleProjectLandingPage />}
          {/* <Footer /> */}
        </Container>
      </Wrapper>
      {/* Include the OverlayDiv so that the login and logout functionality is available on the */}
      {/* custom landing pages */}
      <OverlayDiv />
    </>
  );
};
