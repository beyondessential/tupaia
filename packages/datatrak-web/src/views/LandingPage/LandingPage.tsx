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
  block-size: 100%;
  display: flex;

  ${({ theme }) => {
    const { breakpoints, palette } = theme;

    return css`
      background-image: linear-gradient(
          252deg,
          oklch(from ${palette.primary.main} l c h / 14%) 2%,
          oklch(from ${palette.background.default} l c h / 20%) 29%
        ),
        linear-gradient(
          242deg,
          oklch(from ${palette.background.default} l c h / 30%) 68%,
          oklch(from ${palette.primary.main} l c h / 16%) 100%
        );
      @supports not (color: oklch(from black l c h)) {
        background-image: linear-gradient(
            252deg,
            ${palette.primary.main}24 2%,
            ${palette.background.default}33 29%
          ),
          linear-gradient(
            242deg,
            ${palette.background.default}4d 68%,
            ${palette.primary.main}28 100%
          );
      }

      // Make the container scrollable on small screens
      ${breakpoints.down('sm')} {
        max-block-size: calc(100vb - ${HEADER_HEIGHT});
        overflow-y: auto;
      }
    `;
  }};
`;

const PageBody = styled.div`
  block-size: 100%;
  display: flex;
  flex-direction: column;
  inline-size: 100%;
  margin-block: 0;
  margin-inline: auto;
  max-inline-size: 85rem;
  padding-block: 0.5rem;
  padding-inline: 0;

  // make the body fixed height on large screens
  ${({ theme }) => theme.breakpoints.up('md')} {
    block-size: calc(100vh - ${HEADER_HEIGHT});
    padding-block: 0.2rem 0.8rem;
    padding-inline: 1rem;
  }
`;

const Grid = styled.div<{ $hasMultiple?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-block: 1.3rem;
  margin-inline: auto;
  max-inline-size: 100%;
  min-block-size: 0; // This is needed to stop the grid overflowing the flex container

  .MuiButtonBase-root {
    margin-left: 0; // clear spacing of adjacent buttons
  }

  > section {
    overflow: hidden;
  }

  ${({ $hasMultiple, theme }) => {
    const { up } = theme.breakpoints;
    return css`
      ${up('md')} {
        display: grid;
        grid-template-columns: repeat(3, 1fr) 1.4fr;
        margin-block: 0.5rem;
      }

      ${up('lg')} {
        gap: 1.81rem;
      }

      // If there is only one survey, Recent Surveys section collapses and Activity Feed shifts up
      ${$hasMultiple
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
            grid-template-rows: auto auto 1fr;
          `}
    `;
  }}
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
