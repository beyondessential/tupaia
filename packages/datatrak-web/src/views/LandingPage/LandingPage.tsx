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
  padding: 1.5rem 0;
  width: 100%;
  max-width: 85rem;
  margin: 0 auto;
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding: 4rem 0 2rem;
  }
`;

const Grid = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 2.5rem;

  .MuiButtonBase-root {
    margin-left: 0; // clear spacing of adjacent buttons
  }

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
    gap: 25px 20px;
    grid-template-rows: auto auto;
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      'recentSurveys leaderboard'
      'recentResponses activityFeed';

    section {
      margin: 0;
    }
  }

  ${({ theme }) => theme.breakpoints.up('lg')} {
    grid-template-rows: 180px auto;
    grid-template-columns: 23% 1fr 1fr 28%;
    grid-template-areas:
      'recentSurveys recentSurveys recentSurveys leaderboard'
      'recentResponses activityFeed activityFeed leaderboard';

    > div {
      min-height: auto;
    }
  }
`;

export const LandingPage = () => {
  return (
    <PageContainer>
      <PageBody>
        <SurveySelectSection />
        <Grid>
          <LeaderboardSection />
          <RecentSurveysSection />
          <SurveyResponsesSection />
          <ActivityFeedSection />
        </Grid>
      </PageBody>
    </PageContainer>
  );
};
