/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import { useCurrentUserSurveyResponses } from '../../api/queries';
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
  const { data: recentSurveyResponses, isSuccess } = useCurrentUserSurveyResponses();
  return (
    <Container>
      <SectionHeading>My recent responses</SectionHeading>
      <ScrollBody>
        {isSuccess && recentSurveyResponses?.length > 0 ? (
          recentSurveyResponses.map(({ id, surveyName, dataTime, entityName, countryName }) => (
            <Tile
              key={id}
              title={surveyName}
              text={entityName}
              // Todo: update link to survey response route in WAITP-1452
              to={`/#surveyResponse/${id}`}
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
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No recent surveys responses to display
          </Typography>
        )}
      </ScrollBody>
    </Container>
  );
};
