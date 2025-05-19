import React from 'react';
import styled, { css } from 'styled-components';

import { SafeAreaColumn } from '@tupaia/ui-components';

import { useCurrentUserRecentSurveys } from '../../api';
import { HEADER_HEIGHT } from '../../constants';
import { ActivityFeedSection } from './ActivityFeedSection';
import { LeaderboardSection } from './LeaderboardSection';
import { RecentSurveysSection } from './RecentSurveysSection';
import { SurveyResponsesSection } from './SurveyResponsesSection';
import { SurveySelectSection } from './SurveySelectSection';
import { TasksSection } from './TasksSection';

const PageContainer = styled(SafeAreaColumn).attrs({ component: 'main' })`
  --body-block-size: calc(100dvb - ${HEADER_HEIGHT} - max(0.0625rem, 1px));
  //                                                 ^~~~~~~~~~~~~~~~~~~ Header’s border-block-end-width
  block-size: 100%;
  display: flex;
  max-block-size: var(--body-block-size);
  overflow-y: auto;
  max-inline-size: 100%;
  inline-size: 100%;

  ${({ theme }) => {
    const primaryColor = theme.palette.primary.main;
    const backgroundColor = theme.palette.background.default;
    return css`
      background-image:
        linear-gradient(
          252deg,
          oklch(from ${primaryColor} l c h / 14%) 2%,
          oklch(from ${backgroundColor} l c h / 20%) 29%
        ),
        linear-gradient(
          242deg,
          oklch(from ${backgroundColor} l c h / 30%) 68%,
          oklch(from ${primaryColor} l c h / 16%) 100%
        );
      @supports not (color: oklch(from black l c h)) {
        background-image:
          linear-gradient(252deg, ${primaryColor}24 2%, ${backgroundColor}33 29%),
          linear-gradient(242deg, ${backgroundColor}4d 68%, ${primaryColor}28 100%);
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
  max-inline-size: 88rem;
  padding-block-start: 1rem;
  padding-bottom: max(env(safe-area-inset-bottom), 1rem);

  // make the body fixed height on large screens
  ${({ theme }) => theme.breakpoints.up('md')} {
    block-size: var(--body-block-size);
  }
`;

const Grid = styled.div<{ $hasMultiple?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-block: 1.5rem;
  margin-inline: auto;
  max-inline-size: 100%;
  min-block-size: 50rem;

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
        grid-template-columns: repeat(3, minmax(0, 3fr)) minmax(0, 4fr);
        padding-block: 1rem;
        margin-block: 0;
      }

      // If there is only one survey, Recent Surveys section collapses and Activity Feed shifts up
      ${$hasMultiple
        ? css`
            grid-template-areas:
              '--surveySelect    --surveySelect  --surveySelect  --tasks'
              '--recentSurveys   --recentSurveys --recentSurveys --tasks'
              '--recentResponses --activityFeed  --activityFeed  --leaderboard';
            grid-template-rows: repeat(3, minmax(0, auto));
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
