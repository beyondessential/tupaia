/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import { useCurrentUserContext, useCurrentUserSurveyResponses } from '../../api';
import { displayDate } from '../../utils';
import { LoadingTile, SurveyTickIcon, Tile } from '../../components';
import { SectionHeading } from './SectionHeading';
import { ResponsiveScrollBody } from './ResponsiveScrollBody';

const Container = styled.section`
  grid-area: recentResponses;
  display: flex;
  flex-direction: column;
`;

const ScrollBody = styled(ResponsiveScrollBody)`
  ${({ theme }) => theme.breakpoints.up('md')} {
    display: flex;
    flex-direction: column;
  }
`;

export const SurveyResponsesSection = () => {
  const { data: recentSurveyResponses, isSuccess, isLoading } = useCurrentUserSurveyResponses();
  const { project } = useCurrentUserContext();

  return (
    <Container>
      <SectionHeading>Submission history</SectionHeading>
      <ScrollBody>
        {isLoading && <LoadingTile count={15} />}
        {isSuccess && (
          <>
            {recentSurveyResponses?.length > 0 ? (
              recentSurveyResponses.map(({ id, surveyName, dataTime, entityName, countryName }) => (
                <Tile
                  key={id}
                  title={surveyName}
                  text={entityName}
                  to={`?responseId=${id}`}
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
              ))
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
