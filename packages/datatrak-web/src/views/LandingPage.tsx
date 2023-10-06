/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import { ButtonLink as BaseButtonLink, PageContainer as BasePageContainer } from '../components';
import { ROUTES } from '../constants';

const PageContainer = styled(BasePageContainer)`
  background: url('/landing-page-background.svg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const Wrapper = styled.div`
  padding: 1.5rem 0;
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding: 4rem 0;
  }
`;
const SurveyAlert = styled.div`
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: 3px;
  margin: 0 1.25rem;
  padding: 1rem;
  display: flex;
  position: relative;
  align-items: flex-start;
  justify-content: space-between;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    padding: 2.5rem;
    margin: 0 2rem;
  }
`;

const ButtonLink = styled(BaseButtonLink)`
  font-size: 1rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  & ~ .MuiButtonBase-root {
    margin-left: 0; // override default margin from ui-components
  }
  &:last-child {
    margin-top: 1rem;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: center;
  width: 100%;
  max-width: 20rem;
  ${({ theme }) => theme.breakpoints.up('md')} {
    width: 11rem;
  }
`;

const TextWrapper = styled.div`
  margin: 0;
  display: flex;
  flex-direction: column;
  padding-bottom: 1rem;
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding: 0 6.5rem 0 2rem;
    max-width: 80%;
  }
  ${({ theme }) => theme.breakpoints.up('lg')} {
    padding-right: 8rem;
    width: calc(100% - 10rem);
    max-width: 100%;
  }
`;

const Text = styled(Typography)`
  ${({ theme }) => theme.breakpoints.up('sm')} {
    font-size: 1.375rem;
  }
`;

const DesktopText = styled.span`
  ${({ theme }) => theme.breakpoints.down('sm')} {
    display: none;
  }
`;

const SurveysImage = styled.img`
  width: auto;
  height: calc(100% + 3rem);
  position: absolute;
  display: flex;
  align-items: center;
  right: 0rem;
  top: -1.5rem;
  ${({ theme }) => theme.breakpoints.up('lg')} {
    top: -2.3rem;
    right: 2rem;
    height: calc(100% + 4.6rem);
  }
`;

const SurveyAlertContent = styled.div`
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-start;
  width: 70%;
  padding-right: 2rem;
  ${({ theme }) => theme.breakpoints.up('md')} {
    flex-direction: row;
    width: 100%;
  }
`;

export const LandingPage = () => {
  return (
    <PageContainer>
      <Wrapper>
        <SurveyAlert>
          <SurveyAlertContent>
            <ButtonWrapper>
              <ButtonLink to={ROUTES.SURVEY_SELECT}>Select survey</ButtonLink>
              <ButtonLink to="#" variant="outlined">
                Explore Data
              </ButtonLink>
            </ButtonWrapper>
            <TextWrapper>
              <Text>
                Tupaia DataTrak makes data collection easy!{' '}
                <DesktopText>
                  You can use Tupaia DataTrak to complete surveys (and collect coconuts!), share
                  news, stories and information with the Tupaia community. To collect data offline
                  download our app meditrak from Google Play or Apple App Store.
                </DesktopText>
              </Text>
            </TextWrapper>
          </SurveyAlertContent>
          <SurveysImage src="/surveys.svg" />
        </SurveyAlert>
      </Wrapper>
    </PageContainer>
  );
};
