import React from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { Container as MuiContainer } from '@material-ui/core';
import { useLandingPage, useUser } from '../../api/queries';
import { LoadingScreen } from '../../components';
import { SingleProjectLandingPage } from './SingleProjectLandingPage';
import { LandingPageFooter } from './LandingPageFooter';
import { SingleLandingPage } from '../../types';
import { MultiProjectLandingPage } from './MultiProjectLandingPage';
import { DEFAULT_URL } from '../../constants';

const DEFAULT_LANDING_IMAGE_URL = '/images/custom-landing-page-default.png';

const Wrapper = styled.div<{
  $backgroundImage?: string;
}>`
  position: relative;
  background-size: cover;
  background-position: center;
  background-color: ${({ theme }) => theme.palette.background.default};
  background-image: ${({ $backgroundImage }) => `url(${$backgroundImage})`};
  height: 100%;
  overflow-y: auto;
`;

const Container = styled(MuiContainer)`
  background: linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.7) 100%);
  padding: 1em;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100%;
  @media screen and (min-width: ${({ theme }) =>
      theme.breakpoints.values.sm}px) and (min-height: 600px) {
    padding: 2em 3.5em;
  }
`;

const ProjectScreen = ({
  landingPage,
  isLoggedIn,
}: {
  landingPage: SingleLandingPage;
  isLoggedIn: boolean;
}) => {
  const { projects = [], extendedTitle, includeNameInHeader } = landingPage;

  if (projects.length === 1)
    return (
      <SingleProjectLandingPage
        project={projects[0]}
        extendedTitle={extendedTitle}
        isLoggedIn={isLoggedIn}
        includeNameInHeader={includeNameInHeader}
      />
    );
  return (
    <MultiProjectLandingPage
      projects={projects}
      isLoggedIn={isLoggedIn}
      includeNameInHeader={includeNameInHeader}
    />
  );
};

export const LandingPage = () => {
  const { isLoggedIn } = useUser();
  // use the landingPageUrlSegment to query for the landing page.
  // If found, render landing page. If not, render a default landing page
  const { landingPage, isLoading, isLandingPage } = useLandingPage();
  if (!isLandingPage && !isLoading) return <Navigate to={DEFAULT_URL} replace />;

  const { imageUrl } = landingPage;

  return (
    <Wrapper $backgroundImage={imageUrl || DEFAULT_LANDING_IMAGE_URL}>
      <Container maxWidth={false}>
        {isLoading ? (
          <LoadingScreen isLoading />
        ) : (
          <ProjectScreen landingPage={landingPage} isLoggedIn={isLoggedIn} />
        )}
        <LandingPageFooter landingPage={landingPage} />
      </Container>
    </Wrapper>
  );
};
