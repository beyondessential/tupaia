/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { PageContainer as BasePageContainer } from '../../components';
import { SurveySelectSection } from './SurveySelectSection';
import { SurveyResponsesSection } from './SurveyResponsesSection';
import { LeaderboardSection } from './LeaderboardSection';
import { ActivityFeedSection } from './ActivityFeedSection';
import { RecentSurveysSection } from './RecentSurveysSection';
import { TasksSection } from './TasksSection';
import { DESKTOP_MEDIA_QUERY, HEADER_HEIGHT } from '../../constants';
import { useCurrentUserRecentSurveys } from '../../api';

const PageContainer = styled(BasePageContainer)`
  display: flex;
  background: url('/landing-page-background.svg') center/cover no-repeat;
`;

const PageBody = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0 1.5rem;
  width: 100%;
  max-width: 85rem;
  margin: 0 auto;
  height: auto;

  ${({ theme }) => theme.breakpoints.up('md')} {
    height: calc(100vh - ${HEADER_HEIGHT});
    padding: 0.2rem 1rem 0.8rem;
  }
`;

const Grid = styled.div<{
  $hasMoreThanOneSurvey: boolean;
}>`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
  min-height: 0; // This is needed to stop the grid overflowing the flex container
  max-width: 100%;
  margin-inline: auto;

  .MuiButtonBase-root {
    margin-left: 0; // clear spacing of adjacent buttons
  }

  > section {
    margin-bottom: 1rem;
    overflow: hidden;
  }

  ${({ theme }) => theme.breakpoints.up('sm')} {
    max-width: 38rem;
  }

  ${({ theme }) => theme.breakpoints.up('md')} {
    display: grid;
    gap: 1.25rem;
    grid-template-rows: 20rem auto auto;
    grid-template-columns: 2fr 1fr;
    grid-template-areas:
      'surveySelect tasks'
      'recentSurveys recentResponses'
      'activityFeed leaderboard';
    max-width: none;

    > section {
      margin: 0;
      height: auto;
    }
  }

  ${({ theme }) => theme.breakpoints.up('lg')} {
    grid-template-rows: ${({ $hasMoreThanOneSurvey }) =>
      $hasMoreThanOneSurvey ? '10.5rem auto auto' : '10.5rem 7rem auto'};
    grid-template-columns: 23% 1fr 1fr 30%;
    grid-template-areas: ${({ $hasMoreThanOneSurvey }) => {
      //If there is < 2 surveys, the recentSurveys section will be smaller and the activity feed will shift upwards on larger screens
      if ($hasMoreThanOneSurvey) {
        return `
          'surveySelect surveySelect surveySelect tasks'
          'recentSurveys recentSurveys recentSurveys tasks'
          'recentResponses activityFeed activityFeed leaderboard'
        `;
      }
      return `'surveySelect surveySelect surveySelect tasks'
        'recentSurveys activityFeed activityFeed tasks'
        'recentResponses activityFeed activityFeed leaderboard'
        `;
    }};

    > div {
      min-height: auto;
    }
  }

  ${DESKTOP_MEDIA_QUERY} {
    gap: 1.81rem;
  }
`;

export const LandingPage = () => {
  const { data: recentSurveys = [] } = useCurrentUserRecentSurveys();
  const hasMoreThanOneSurvey = recentSurveys.length > 1;

  return (
    <PageContainer>
      <PageBody>
        <Grid $hasMoreThanOneSurvey={hasMoreThanOneSurvey}>
          <SurveySelectSection />
          <TasksSection />
          <LeaderboardSection />
          <RecentSurveysSection />
          <SurveyResponsesSection />
          <ActivityFeedSection />
        </Grid>
      </PageBody>
    </PageContainer>
  );
};
