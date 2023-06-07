/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Container as MuiContainer } from '@material-ui/core';
import { LandingPageResponse } from '@tupaia/types';
import { useLandingPage } from '../../api/queries';

const DEFAULT_LANDING_IMAGE_URL = '/images/custom-landing-page-default.png';

const Wrapper = styled.div<{
  $backgroundImage?: string;
}>`
  position: relative;
  background-size: cover;
  background-position: center;
  background-color: #262834;
  background-image: ${({ $backgroundImage }) => `url(${$backgroundImage})`};
`;

const Container = styled(MuiContainer)`
  background: linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.7) 100%);
  padding: 1em;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: calc(100vh - ${({ theme }) => theme.topBarHeight.mobile}px);
  overflow-y: auto;
  @media screen and (min-width: ${({ theme }) =>
      theme.breakpoints.values.sm}px) and (min-height: 600px) {
    padding: 2em 3.5em;
    min-height: calc(100vh - ${({ theme }) => theme.topBarHeight.default}px);
  }
`;

export const LandingPage = () => {
  const { landingPageUrlSegment } = useParams();
  const { data = {} } = useLandingPage(landingPageUrlSegment!);
  const { imageUrl } = data as LandingPageResponse;

  // use the landingPageUrlSegment to query for the landing page.
  // If found, render landing page. If not, render a default landing page
  return (
    <Wrapper $backgroundImage={imageUrl || DEFAULT_LANDING_IMAGE_URL}>
      <Container maxWidth={false}>Hi</Container>
    </Wrapper>
  );
};
