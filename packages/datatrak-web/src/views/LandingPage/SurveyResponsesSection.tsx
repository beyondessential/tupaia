/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useCurrentUserSurveyResponses } from '../../api/queries';
import { Tile } from '../../components';
import { shortDate } from '../../utils';
import { SectionHeading } from './SectionHeading';
import styled from 'styled-components';

const Container = styled.section`
  grid-area: recentResponses;
  display: flex;
  flex-direction: column;
`;

const ScrollBody = styled.div`
  overflow: auto;

  ${({ theme }) => theme.breakpoints.down('sm')} {
    display: flex;
    flex-direction: row;

    > a {
      min-width: 15rem;
      margin-right: 1rem;
    }
  }
`;

export const SurveyResponsesSection = () => {
  const { data, isSuccess } = useCurrentUserSurveyResponses();
  return (
    <Container>
      <SectionHeading>My recent responses</SectionHeading>
      <ScrollBody>
        {isSuccess &&
          data.map(({ id, surveyName, dataTime, entityName, countryName }) => (
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
            >
              {countryName}, {shortDate(dataTime)}
            </Tile>
          ))}
      </ScrollBody>
    </Container>
  );
};
