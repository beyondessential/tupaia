/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { SectionHeading } from './SectionHeading';
import { SurveyIcon, Tile } from '../../components';
import { Typography } from '@material-ui/core';

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

const TEST_SURVEYS = [
  {
    id: '1',
    name: 'Survey 1',
    code: 'SURVEY_1',
    country: 'Vanuatu',
  },
  {
    id: '2',
    name: 'Survey 2',
    code: 'SURVEY_2',
    country: 'Tonga',
  },
  // {
  //   id: '3',
  //   name: 'Survey 3',
  //   code: 'SURVEY_3',
  //   country: 'Tonga',
  // },
  // { id: '4', name: 'Survey 4', code: 'SURVEY_4', country: 'Tonga' },
  // { id: '5', name: 'Survey 5', code: 'SURVEY_5', country: 'Tonga' },
  // { id: '6', name: 'Survey 6', code: 'SURVEY_6', country: 'Tonga' },
];

export const RecentSurveysSection = () => {
  const surveys = TEST_SURVEYS;
  return (
    <RecentSurveys>
      <SectionHeading>My recent surveys</SectionHeading>
      <ScrollBody>
        {surveys?.length ? (
          surveys?.map(({ id, name, code, country }) => (
            <Tile
              key={id}
              title={name}
              text={country}
              to={`survey/${code}`}
              tooltip={name}
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
