/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import { SpinningLoader } from '@tupaia/ui-components';
import { useNavigate } from 'react-router';
import { useCurrentUser, useCurrentUserSurveyResponses, useEditUser } from '../../api';
import { SurveyTickIcon, Tile } from '../../components';
import { shortDate } from '../../utils';
import { SectionHeading } from './SectionHeading';

const Container = styled.section`
  grid-area: recentResponses;
  display: flex;
  flex-direction: column;
`;

const ScrollBody = styled.div`
  overflow: auto;
  > span {
    margin-bottom: 0.6rem;
  }
  ${({ theme }) => theme.breakpoints.down('sm')} {
    display: flex;
    flex-direction: row;

    > span {
      min-width: 15rem;
      margin-right: 1rem;
    }
  }
`;

export const SurveyResponsesSection = () => {
  const navigate = useNavigate();
  const { data: recentSurveyResponses, isSuccess, isLoading } = useCurrentUserSurveyResponses();
  const user = useCurrentUser();
  const { mutateAsync: editUser } = useEditUser();

  const handleSelectSurveyResponse = async (
    surveyCode: string,
    countryCode: string,
    countryId: string,
    surveyResponseId: string,
  ) => {
    // Set the selected country in the user's profile if it is different to selected survey's country
    if (user.country?.id !== countryId) {
      await editUser({
        countryId,
      });
    }
    // then navigate to the survey response
    navigate(`/survey/${countryCode}/${surveyCode}/response/${surveyResponseId}`);
  };
  return (
    <Container>
      <SectionHeading>My recent responses</SectionHeading>
      {isLoading && <SpinningLoader />}
      {isSuccess && (
        <ScrollBody>
          {recentSurveyResponses?.length > 0 ? (
            recentSurveyResponses.map(
              ({
                id,
                surveyName,
                surveyCode,
                dataTime,
                entityName,
                countryId,
                countryName,
                countryCode,
              }) => (
                <Tile
                  key={id}
                  title={surveyName}
                  text={entityName}
                  onClick={() => handleSelectSurveyResponse(surveyCode, countryCode, countryId, id)}
                  tooltip={
                    <>
                      {surveyName}
                      <br />
                      {entityName}
                    </>
                  }
                  Icon={SurveyTickIcon}
                >
                  {countryName}, {shortDate(dataTime)}
                </Tile>
              ),
            )
          ) : (
            <Typography variant="body2" color="textSecondary">
              No recent surveys responses to display
            </Typography>
          )}
        </ScrollBody>
      )}
    </Container>
  );
};
