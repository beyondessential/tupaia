/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Container as MuiContainer } from '@material-ui/core';
import { useLandingPage } from '../../api/queries';
import { LoadingScreen } from '../../components';
import { SingleProjectLandingPage } from './SingleProjectLandingPage';
import { LandingPageFooter } from './LandingPageFooter';
import { SingleLandingPage } from '../../types';
import { MultiProjectLandingPage } from './MultiProjectLandingPage';

const DEFAULT_LANDING_IMAGE_URL = '/images/custom-landing-page-default.png';

const Wrapper = styled.div<{
  $backgroundImage?: string;
}>`
  position: relative;
  background-size: cover;
  background-position: center;
  background-color: #262834;
  background-image: ${({ $backgroundImage }) => `url(${$backgroundImage})`};
  height: 100%;
`;

const Container = styled(MuiContainer)`
  background: linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.7) 100%);
  padding: 1em;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-y: auto;
  height: 100%;
  @media screen and (min-width: ${({ theme }) =>
      theme.breakpoints.values.sm}px) and (min-height: 600px) {
    padding: 2em 3.5em;
  }
`;

export const LandingPage = () => {
  const { landingPageUrlSegment } = useParams();
  const { landingPage, isLoading } = useLandingPage(landingPageUrlSegment!);
  const {
    imageUrl,
    projects = [],
    extendedTitle,
    longBio,
    name,
    includeNameInHeader = false,
    externalLink,
    phoneNumber,
    websiteUrl,
    primaryHexcode,
  } = landingPage as SingleLandingPage;

  // This will come from actual login state once merged in
  const isUserLoggedIn = true;

  // use the landingPageUrlSegment to query for the landing page.
  // If found, render landing page. If not, render a default landing page
  return (
    <Wrapper $backgroundImage={imageUrl || DEFAULT_LANDING_IMAGE_URL}>
      <Container maxWidth={false}>
        {isLoading && <LoadingScreen isLoading />}
        {projects.length === 1 ? (
          <SingleProjectLandingPage
            project={projects[0]}
            extendedTitle={extendedTitle}
            includeNameInHeader={includeNameInHeader}
            isUserLoggedIn={isUserLoggedIn}
          />
        ) : (
          <MultiProjectLandingPage
            projects={projects}
            isUserLoggedIn={isUserLoggedIn}
            includeNameInHeader={includeNameInHeader}
          />
        )}
        <LandingPageFooter
          includeNameInHeader={includeNameInHeader}
          websiteUrl={websiteUrl}
          name={name}
          externalLink={externalLink}
          longBio={longBio}
          phoneNumber={phoneNumber}
        />
      </Container>
    </Wrapper>
  );
};
