/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import { useCurrentUser, useCurrentUserSurveyResponses } from '../../api';
import { displayDate } from '../../utils';
import { LoadingTile, SurveyTickIcon, Tile } from '../../components';
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
  const { data: recentSurveyResponses, isSuccess, isLoading } = useCurrentUserSurveyResponses();
  const { project } = useCurrentUser();

  return (
    <Container>
      <SectionHeading>Submission history</SectionHeading>
      <ScrollBody>
        {isLoading && <LoadingTile count={15} />}
        {isSuccess && (
          <>
            {recentSurveyResponses?.length > 0 ? (
              recentSurveyResponses.map(
                ({
                  id,
                  surveyName,
                  surveyCode,
                  dataTime,
                  entityName,
                  countryName,
                  countryCode,
                }) => (
                  <Tile
                    key={id}
                    title={surveyName}
                    text={entityName}
                    to={`/survey/${countryCode}/${surveyCode}/response/${id}`}
                    tooltip={
                      <>
                        {surveyName}
                        <br />
                        {entityName}
                      </>
                    }
                    Icon={SurveyTickIcon}
                  >
                    {countryName}, {displayDate(dataTime)}
                  </Tile>
                ),
              )
            ) : (
              <Typography variant="body2" color="textSecondary">
                No recent surveys responses to display for {project?.name || 'project'}
              </Typography>
            )}{' '}
          </>
        )}
      </ScrollBody>
    </Container>
  );
};
