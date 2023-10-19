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
import { HEADER_HEIGHT } from '../../constants';

const PageContainer = styled(BasePageContainer)`
  display: flex;
  background: url('/landing-page-background.svg') center/cover no-repeat;
`;

const PageBody = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0;
  width: 100%;
  max-width: 85rem;
  margin: 0 auto;
  height: auto;

  ${({ theme }) => theme.breakpoints.up('md')} {
    height: calc(100vh - ${HEADER_HEIGHT});
    padding: 4rem 0 2rem;
  }
`;

const Grid = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 2.5rem;
  min-height: 0; // This is needed to stop the grid overflowing the flex container

  .MuiButtonBase-root {
    margin-left: 0; // clear spacing of adjacent buttons
  }

  > section {
    margin-bottom: 1rem;
    overflow: hidden;
  }

  ${({ theme }) => theme.breakpoints.up('md')} {
    display: grid;
    gap: 1.6rem 1.25rem;
    grid-template-rows: auto auto;
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      'recentSurveys leaderboard'
      'recentResponses activityFeed';

    > section {
      margin: 0;
      height: auto;
    }
  }

  ${({ theme }) => theme.breakpoints.up('lg')} {
    grid-template-rows: 11.25rem auto;
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
