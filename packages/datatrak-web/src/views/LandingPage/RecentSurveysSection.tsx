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

const RecentSurveys = styled.section`
  grid-area: recentSurveys;
  display: flex;
  flex-direction: column;
`;

const ScrollBody = styled.div<{
  $hasMoreThanOneSurvey: boolean;
}>`
  border-radius: 10px;
  display: grid;
  grid-template-columns: ${({ $hasMoreThanOneSurvey }) =>
    $hasMoreThanOneSurvey ? ' repeat(auto-fill, minmax(calc(33.3% - 1rem), 1fr))' : '1fr'};
  grid-column-gap: 1rem;
  grid-row-gap: 0.6rem;

  // make a vertical scrollable container for medium screens (tablet)
  ${({ theme }) => theme.breakpoints.down('md')} {
    grid-template-columns: 1fr;
    overflow: auto;
  }
  // make a horizontal scrollable container for small screens
  ${({ theme }) => theme.breakpoints.down('sm')} {
    grid-auto-flow: column;
    grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
    overflow: auto;
    > .MuiButton-root {
      min-width: 15rem;
    }
  }
`;

export const RecentSurveysSection = () => {
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
                    <>
                      {surveyName}
                      <br />
                      {countryName}
                    </>
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
