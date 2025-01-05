/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { SurveyIcon, Tile, LoadingTile } from '../../components';
import { useCurrentUserRecentSurveys } from '../../api';
import { SectionHeading } from './SectionHeading';
import { useIsMobile } from '../../utils';

const RecentSurveys = styled.section`
  grid-area: recentSurveys;
  display: flex;
  flex-direction: column;
`;

const ScrollBody = styled.div<{
  $hasMoreThanOneSurvey: boolean;
}>`
  display: flex;
  overflow-x: auto;
  column-gap: 1rem;
  row-gap: 0.6rem;

  > span,
  > a {
    width: 18rem;
    max-width: 100%;
    //Reset flex grow and shrink
    flex: 0 0 auto;
  }
  // make the 2 row grid on desktop
  ${({ theme }) => theme.breakpoints.up('md')} {
    display: grid;
    grid-template-rows: 1fr;
    grid-auto-flow: row;
    grid-template-columns: ${({ $hasMoreThanOneSurvey }) =>
      $hasMoreThanOneSurvey ? ' repeat(auto-fill, minmax(calc(33.3% - 1rem), 1fr))' : '1fr'};
  }
`;

export const RecentSurveysSection = () => {
  const isMobile = useIsMobile();
  const { data: recentSurveys = [], isSuccess, isLoading } = useCurrentUserRecentSurveys();
  const hasMoreThanOneSurvey = recentSurveys.length > 1;

  return (
    <RecentSurveys>
      <SectionHeading>Top surveys</SectionHeading>
      <ScrollBody $hasMoreThanOneSurvey={hasMoreThanOneSurvey}>
        {isLoading && <LoadingTile />}
        {isSuccess && (
          <>
            {recentSurveys?.length ? (
              recentSurveys.map(({ surveyName, surveyCode, countryName, countryCode }) => (
                <Tile
                  key={`${surveyCode}-${countryName}`}
                  title={surveyName}
                  text={countryName}
                  tooltip={
                    !isMobile ? (
                      <>
                        {surveyName}
                        <br />
                        {countryName}
                      </>
                    ) : null
                  }
                  Icon={SurveyIcon}
                  to={`/survey/${countryCode}/${surveyCode}/1`}
                />
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                No recent surveys to display
              </Typography>
            )}
          </>
        )}
      </ScrollBody>
    </RecentSurveys>
  );
};
