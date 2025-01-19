import React from 'react';
import styled, { css } from 'styled-components';

import { useCurrentUserRecentSurveys } from '../../api';
import { PageContainer as BasePageContainer } from '../../components';
import { HEADER_HEIGHT } from '../../constants';
import { ActivityFeedSection } from './ActivityFeedSection';
import { LeaderboardSection } from './LeaderboardSection';
import { RecentSurveysSection } from './RecentSurveysSection';
import { SurveyResponsesSection } from './SurveyResponsesSection';
import { SurveySelectSection } from './SurveySelectSection';
import { TasksSection } from './TasksSection';

const PageContainer = styled(BasePageContainer)`
  display: flex;
  background: ${({
    theme,
  }) => `linear-gradient(252deg, ${theme.palette.primary.main}24 1.92%, ${theme.palette.background.default}33 29.06%),
    linear-gradient(242deg, ${theme.palette.background.default}4d 68.02%, ${theme.palette.primary.main}28 100%);
  `};
  height: 100%;
  // make the container scrollable on small screens
  ${({ theme }) => theme.breakpoints.down('sm')} {
    max-height: calc(100vh - ${HEADER_HEIGHT});
    overflow-y: auto;
  }
`;

const PageBody = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0 0.5rem;
  width: 100%;
  max-width: 85rem;
  margin: 0 auto;
  height: 100%;

  // make the body fixed height on large screens
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding: 0.2rem 1rem 0.8rem;
    height: calc(100vh - ${HEADER_HEIGHT});
  }
`;

const Grid = styled.div<{ $hasMultiple?: boolean }>`
  display: flex;
  flex-direction: column;
  min-height: 0; // This is needed to stop the grid overflowing the flex container
  max-width: 100%;
  margin-inline: auto;
  margin-block: 1.3rem;

  .MuiButtonBase-root {
    margin-left: 0; // clear spacing of adjacent buttons
  }

  > section {
    overflow: hidden;
  }

  ${({ theme }) => theme.breakpoints.up('md')} {
    gap: 1.5rem;
    display: grid;
    grid-template-columns: repeat(3, 1fr) 1.25fr;
    margin-block: 0.5rem;

    // If there is only one survey, Recent Surveys section collapses and Activity Feed shifts up
    ${({ $hasMultiple }) =>
      $hasMultiple
        ? css`
            grid-template-areas:
              '--surveySelect    --surveySelect  --surveySelect  --tasks'
              '--recentSurveys   --recentSurveys --recentSurveys --tasks'
              '--recentResponses --activityFeed  --activityFeed  --leaderboard';
            grid-template-rows: repeat(3, auto);
          `
        : css`
            grid-template-areas:
              '--surveySelect    --surveySelect --surveySelect --tasks'
              '--recentSurveys   --activityFeed --activityFeed --tasks'
              '--recentResponses --activityFeed --activityFeed --leaderboard';
            grid-template-rows: auto 7rem auto;
          `}
  }

  ${({ theme }) => theme.breakpoints.up('lg')} {
    gap: 1.81rem;
  }
`;

export const LandingPage = () => {
  const { data: recentSurveys = [] } = useCurrentUserRecentSurveys();
  const hasMoreThanOneSurvey = recentSurveys.length > 1;

  return (
    <PageContainer>
      <PageBody>
        <Grid $hasMultiple={hasMoreThanOneSurvey}>
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
