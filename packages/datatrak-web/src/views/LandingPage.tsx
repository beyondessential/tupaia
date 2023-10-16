/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import {
  ButtonLink as BaseButtonLink,
  PageContainer as BasePageContainer,
  Tile,
} from '../components';
import { ROUTES } from '../constants';
import { useCurrentUserSurveyResponses } from '../api/queries';

const PageContainer = styled(BasePageContainer)`
  display: flex;
  background: url('/landing-page-background.svg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1.5rem;
  width: 100%;
  max-width: 85rem;
  margin: 0 auto;
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding: 4rem 1.5rem 3rem;
  }
`;

const SurveyAlert = styled.div`
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: 0.625rem;
  margin: 0 1.25rem;
  padding: 1rem;
  display: flex;
  position: relative;
  align-items: flex-start;
  justify-content: space-between;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    padding: 1rem 2.3rem;
    margin: 0;
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
  .MuiButton-root {
    line-height: 1.1;
    padding: 0.75rem;
    &:last-child {
      margin-top: 0.625rem;
    }
  }
`;

const TextWrapper = styled.div`
  margin: 0;
  display: flex;
  flex-direction: column;
  padding-bottom: 1rem;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    padding-left: 2rem;
    padding-right: 4rem;
    max-width: 75%;
  }

  ${({ theme }) => theme.breakpoints.up('lg')} {
    padding-right: 1rem;
    max-width: 80%;
  }
`;

const Text = styled(Typography)`
  ${({ theme }) => theme.breakpoints.up('sm')} {
    font-size: 1.0625rem;
    line-height: 1.5;
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
  right: 0;
  top: -1.5rem;
  ${({ theme }) => theme.breakpoints.up('md')} {
    top: -3rem;
    right: 2rem;
    height: calc(100% + 6rem);
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

const SurveySelectSection = () => (
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
            You can use Tupaia DataTrak to complete surveys (and collect coconuts!), share news,
            stories and information with the Tupaia community. To collect data offline, please
            download our mobile app, Tupaia MediTrak from Google Play or the Apple App Store.
          </DesktopText>
        </Text>
      </TextWrapper>
    </SurveyAlertContent>
    <SurveysImage src="/surveys.svg" />
  </SurveyAlert>
);

const LeaderBoard = styled.div`
  grid-area: leaderboard;
`;

const RecentSurveys = styled.div`
  grid-area: recentSurveys;
`;

const RecentResponses = styled.div`
  grid-area: recentResponses;
`;

const ActivityFeed = styled.div`
  grid-area: activityFeed;
  margin-left: 1rem;
  margin-right: 1rem;
`;

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 70px;

  > div {
    display: flex;
    flex-direction: column;
    min-height: 300px;
  }

  section {
    background: white;
    border-radius: 10px;
    margin-bottom: 1rem;
    flex: 1;
  }

  ${({ theme }) => theme.breakpoints.up('md')} {
    display: grid;
    gap: 15px 10px;
    grid-template-rows: auto auto;
    grid-template-areas:
      'recentSurveys leaderboard'
      'recentResponses activityFeed';

    section {
      margin: 0;
    }
  }

  ${({ theme }) => theme.breakpoints.up('lg')} {
    grid-template-rows: 180px auto;
    grid-template-columns: 1fr 1fr 1fr 30%;
    grid-template-areas:
      'recentSurveys recentSurveys recentSurveys leaderboard'
      'recentResponses activityFeed activityFeed leaderboard';

    > div {
      min-height: auto;
    }
  }
`;

const Heading = styled.div`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 0.75rem;
`;

const recentSurveys = [
  {
    id: '1',
    surveyName: 'Survey 1',
    date: '2021-01-01',
    entityName: 'Ba Health Centre',
    countryName: 'Fiji',
  },
  {
    id: '2',
    surveyName: 'Health supply chain',
    date: '2021-01-01',
    entityName: 'Ba Health Centre',
    countryName: 'Fiji',
  },
  {
    id: '3',
    surveyName: 'Local supply chain',
    date: '2021-01-01',
    entityName: 'Ba Health Centre',
    countryName: 'Fiji',
  },
  {
    id: '4',
    surveyName: 'Local supply chain',
    date: '2021-01-01',
    entityName: 'Ba Health Centre',
    countryName: 'Fiji',
  },
  {
    id: '5',
    surveyName: 'Local supply chain',
    date: '2021-01-01',
    entityName: 'Ba Health Centre',
    countryName: 'Fiji',
  },
  {
    id: '6',
    surveyName: 'Local supply chain',
    date: '2021-01-01',
    entityName: 'Ba Health Centre',
    countryName: 'Fiji',
  },
];

export const LandingPage = () => {
  const { data } = useCurrentUserSurveyResponses();
  console.log(data);
  return (
    <PageContainer>
      <Wrapper>
        <SurveySelectSection />
        <Container>
          <LeaderBoard>
            <Heading>Leaderboard</Heading>
            <section></section>
          </LeaderBoard>
          <RecentSurveys>
            <Heading>Recent Surveys</Heading>
            <section></section>
          </RecentSurveys>
          <RecentResponses>
            <Heading>Recent Responses</Heading>
            {recentSurveys.map(({ id, surveyName, date, entityName, countryName }) => (
              <>
                <Tile key={id} title={surveyName} text={entityName} link="test">
                  {countryName}, {date}
                </Tile>
              </>
            ))}
          </RecentResponses>
          <ActivityFeed>
            <Heading>Activity Feed</Heading>
            <section></section>
          </ActivityFeed>
        </Container>
      </Wrapper>
    </PageContainer>
  );
};
