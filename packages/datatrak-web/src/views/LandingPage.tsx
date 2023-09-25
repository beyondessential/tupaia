/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ButtonLink, PageContainer as BasePageContainer } from '../components';
import styled from 'styled-components';
import { MOBILE_BREAKPOINT, ROUTES } from '../constants';
import { Typography, Link } from '@material-ui/core';

const PageContainer = styled(BasePageContainer)`
  background: url('/landing-page-background.svg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const Wrapper = styled.div`
  padding: 4rem 0;
`;
const SurveyAlert = styled.div`
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: 3px;
  margin: 0 2rem;
  padding: 2.5rem;
  display: flex;
  position: relative;
  align-items: flex-start;
`;

const OutlinedButton = styled(ButtonLink).attrs({
  variant: 'outlined',
})`
  margin-top: 1rem;
  font-size: 1rem;
`;

const PrimaryButton = styled(ButtonLink)`
  font-size: 1rem;
  & ~ .MuiButtonBase-root {
    margin-left: 0; // override default margin from ui-components
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: center;
  @media (min-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    width: 11rem;
  }
`;

const TextWrapper = styled.div`
  padding: 0 2rem;
  max-width: 80%;
  margin: 0;
  display: flex;
  flex-direction: column;
  @media screen and (min-width: ${({ theme }) => theme.breakpoints.values.lg}px) {
    padding: 0 12rem 0 2rem;
    width: calc(100% - 10rem);
    max-width: 100%;
  }
`;

const Text = styled(Typography)`
  font-size: 1.375rem;
`;

const MobileText = styled.span`
  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const DesktopText = styled.span`
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const InlineLink = styled(Link)`
  color: ${({ theme }) => theme.palette.text.primary};
  text-decoration: underline;
`;

const SurveysImage = styled.img`
  width: auto;
  @media screen and (min-width: ${({ theme }) => theme.breakpoints.values.lg}px) {
    height: calc(100% + 4.6rem);
    position: absolute;
    right: 5rem;
    top: -2.3rem;
  }
`;

export const LandingPage = () => {
  const getMobileAppLink = () => {
    // Direct to the app store if the user is on a mac, else the play store
    const isMac = window.navigator.userAgent.toUpperCase().indexOf('MAC') >= 0;
    if (isMac) {
      return 'https://itunes.apple.com/us/app/tupaia-meditrak/id1245053537';
    }
    return 'https://play.google.com/store/apps/details?id=com.tupaiameditrak';
  };

  const linkToMobileApp = getMobileAppLink();

  return (
    <PageContainer>
      <Wrapper>
        <SurveyAlert>
          <ButtonWrapper>
            <PrimaryButton to={ROUTES.SURVEY_SELECT}>Select survey</PrimaryButton>
            <OutlinedButton to="#">Explore Data</OutlinedButton>
          </ButtonWrapper>
          <TextWrapper>
            <Text>
              Tupaia DataTrak makes data collection easy! You can use Tupaia DataTrak to complete
              surveys (and collect coconuts!), share news, stories and information with the Tupaia
              community. To collect data offline,{' '}
              <MobileText>
                please download our app, Tupaia MediTrak{' '}
                <InlineLink href={linkToMobileApp} target="_blank">
                  here
                </InlineLink>
              </MobileText>
              <DesktopText>
                download our app meditrak from Google Play or Apple App Store
              </DesktopText>
              .
            </Text>
          </TextWrapper>
          <SurveysImage src="/surveys.svg" />
        </SurveyAlert>
      </Wrapper>
    </PageContainer>
  );
};
