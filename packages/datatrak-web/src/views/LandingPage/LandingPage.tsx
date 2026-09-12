import React from 'react';
import styled, { css } from 'styled-components';

import { SafeAreaColumn } from '@tupaia/ui-components';

// TUP-3193 diagnostic: import { useCurrentUserRecentSurveys, useSurveyResponseDrafts } from '../../api';
import { BOTTOM_NAVIGATION_HEIGHT_SMALL, HEADER_HEIGHT } from '../../constants';
import { sampleRuntime } from '../../utils'; // TEMPORARY DIAGNOSTIC (TUP-3193)
// TUP-3193 diagnostic: import { ActivityFeedSection } from './ActivityFeedSection';
// TUP-3193 diagnostic: import { DraftSurveysSection } from './DraftSurveysSection';
// TUP-3193 diagnostic: import { LeaderboardSection } from './LeaderboardSection';
// TUP-3193 diagnostic: import { RecentSurveysSection } from './RecentSurveysSection';
// TUP-3193 diagnostic: import { SurveyResponsesSection } from './SurveyResponsesSection';
// TUP-3193 diagnostic: import { SurveySelectSection } from './SurveySelectSection';
// TUP-3193 diagnostic: import { TasksSection } from './TasksSection';

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
  margin-block-end: ${BOTTOM_NAVIGATION_HEIGHT_SMALL}; // Padding accounts for safe area insets
  margin-inline: auto;
  max-inline-size: 88rem;
  padding-block-start: 1rem;
  padding-bottom: max(env(safe-area-inset-bottom), 1rem);

  // make the body fixed height on large screens
  ${({ theme }) => theme.breakpoints.up('md')} {
    block-size: var(--body-block-size);
    margin-block-end: 0;
  }
`;

const Grid = styled.div<{ $hasMultiple?: boolean; $hasDrafts?: boolean }>`
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

  ${({ $hasMultiple, $hasDrafts, theme }) => {
    const { up } = theme.breakpoints;
    return css`
      ${up('md')} {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 3fr)) minmax(0, 4fr);
        padding-block: 1rem;
        margin-block: 0;
      }

      // If there is only one survey, Recent Surveys section collapses and Activity Feed shifts up
      ${$hasMultiple && !$hasDrafts
        ? css`
            grid-template-areas:
              '--surveySelect    --surveySelect  --surveySelect  --tasks'
              '--recentSurveys   --recentSurveys --recentSurveys --tasks'
              '--recentResponses --activityFeed  --activityFeed  --leaderboard';
            grid-template-rows: repeat(3, minmax(0, auto));
          `
        : $hasDrafts
          ? css`
              grid-template-areas:
                '--surveySelect    --surveySelect  --surveySelect  --tasks'
                '--draftSurveys    --draftSurveys  --draftSurveys  --tasks'
                '--recentSurveys   --recentSurveys --recentSurveys --tasks'
                '--recentResponses --activityFeed  --activityFeed  --leaderboard';
              grid-template-rows: repeat(4, minmax(0, auto));
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

/*
 * TEMPORARY DIAGNOSTIC (TUP-3193) — step 0 of bisecting the idle-then-crash. Restore from git.
 *
 * Every section and both data hooks are removed, leaving only the page chrome. MainPageLayout is
 * untouched, so the Header and BottomNavigation still render exactly as before — this isolates the
 * landing page's *content* and nothing else.
 *
 *   Still crashes  -> content is exonerated; the cause is in the shell (Header,
 *                     BannerNotifications, UnsyncedDataGuard, BottomNavigation,
 *                     SurveyResponseModal) or the providers.
 *   Stops crashing -> it is one of the seven sections; restore the livelier half first
 *                     (LeaderboardSection, ActivityFeedSection, SurveyResponsesSection).
 */
export const LandingPage = () => {
  React.useEffect(() => {
    sampleRuntime({ at: 'landing:mounted' });
  }, []);

  return (
    <PageContainer>
      <PageBody>
        <Grid />
      </PageBody>
    </PageContainer>
  );
};
