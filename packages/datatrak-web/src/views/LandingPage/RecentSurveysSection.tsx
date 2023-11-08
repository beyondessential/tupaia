/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router';
import { SectionHeading } from './SectionHeading';
import { SurveyIcon, Tile } from '../../components';
import { Typography } from '@material-ui/core';
import { useCurrentUserRecentSurveys } from '../../api/queries';
import { useEditUser } from '../../api/mutations';

const RecentSurveys = styled.section`
  grid-area: recentSurveys;
  display: flex;
  flex-direction: column;
`;

const ScrollBody = styled.div`
  border-radius: 10px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(calc(33.3% - 1rem), 1fr));
  grid-column-gap: 1rem;

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
  const { data: recentSurveys = [], isSuccess } = useCurrentUserRecentSurveys();
  const navigate = useNavigate();
  const { mutateAsync: editUser } = useEditUser();

  const handleSelectSurvey = async (surveyCode: string, countryId: string) => {
    // set the selected country in the user's profile
    await editUser({
      countryId,
    });
    // then navigate to the survey
    navigate(`survey/${surveyCode}/1`);
  };
  return (
    <RecentSurveys>
      <SectionHeading>My recent surveys</SectionHeading>
      <ScrollBody>
        {isSuccess && recentSurveys?.length ? (
          recentSurveys.map(({ surveyName, surveyCode, countryName, countryId }) => (
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
              onClick={() => handleSelectSurvey(surveyCode, countryId)}
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
