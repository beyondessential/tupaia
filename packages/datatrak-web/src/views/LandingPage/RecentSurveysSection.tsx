/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { SectionHeading } from './SectionHeading';
import { SurveyIcon, Tile } from '../../components';
import { Typography } from '@material-ui/core';
import { useCurrentUserRecentSurveys } from '../../api/queries';

const RecentSurveys = styled.section`
  grid-area: recentSurveys;
  display: flex;
  flex-direction: column;
`;

const ScrollBody = styled.div`
  border-radius: 10px;
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  > a {
    flex: 0 0 calc(33% - 1rem);
    margin-right: 1rem;
  }

  ${({ theme }) => theme.breakpoints.down('sm')} {
    flex-wrap: nowrap;
    overflow: auto;
    > a {
      min-width: 15rem;

      flex: 0 0 auto;
    }
  }

  ${({ theme }) => theme.breakpoints.up('lg')} {
    min-height: auto;
  }
`;

export const RecentSurveysSection = () => {
  const { data } = useCurrentUserRecentSurveys();
  return (
    <RecentSurveys>
      <SectionHeading>My recent surveys</SectionHeading>
      <ScrollBody>
        {data?.length ? (
          data?.map(({ surveyName, surveyCode, countryName }) => (
            <Tile
              key={`${surveyCode}-${countryName}`}
              title={surveyName}
              text={countryName}
              to={`survey/${surveyCode}/1`}
              tooltip={surveyName}
              Icon={SurveyIcon}
            />
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No recent surveys to display
          </Typography>
        )}
      </ScrollBody>
    </RecentSurveys>
  );
};
