/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { PageContainer as BasePageContainer, Tile } from '../../components';
import { useCurrentUserSurveyResponses } from '../../api/queries';
import { SurveySelectSection } from './SurveySelectSection';

const PageContainer = styled(BasePageContainer)`
  display: flex;
  background: url('/landing-page-background.svg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const PageBody = styled.div`
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

const Grid = styled.div`
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

const SectionHeading = styled.div`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 0.75rem;
`;

const LeaderBoardSection = () => {
  return (
    <LeaderBoard>
      <SectionHeading>Leaderboard</SectionHeading>
      <section></section>
    </LeaderBoard>
  );
};

const RecentSurveysSection = () => {
  return (
    <RecentSurveys>
      <SectionHeading>Recent Surveys</SectionHeading>
      <section></section>
    </RecentSurveys>
  );
};

// Todo: update link to survey response route in WAITP-1452
const RecentResponsesSection = () => {
  const { data, isSuccess } = useCurrentUserSurveyResponses();
  return (
    <RecentResponses>
      <SectionHeading>Recent Responses</SectionHeading>
      {isSuccess &&
        data.map(({ id, surveyName, dataTime, entityName, countryName }) => (
          <Tile key={id} title={surveyName} text={entityName} to={`/#surveyResponse/${id}`}>
            {countryName}, {new Date(dataTime).toDateString()}
          </Tile>
        ))}
    </RecentResponses>
  );
};

const ActivityFeedSection = () => {
  return (
    <ActivityFeed>
      <SectionHeading>Activity Feed</SectionHeading>
      <section></section>
    </ActivityFeed>
  );
};

export const LandingPage = () => {
  return (
    <PageContainer>
      <PageBody>
        <SurveySelectSection />
        <Grid>
          <LeaderBoardSection />
          <RecentSurveysSection />
          <RecentResponsesSection />
          <ActivityFeedSection />
        </Grid>
      </PageBody>
    </PageContainer>
  );
};
