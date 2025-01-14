/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import { useCurrentUserContext, useCurrentUserSurveyResponses } from '../../api';
import { displayDate, useIsMobile } from '../../utils';
import { LoadingTile, SurveyTickIcon, Tile } from '../../components';
import { SectionHeading } from './SectionHeading';

const Container = styled.section`
  grid-area: recentResponses;
  display: flex;
  flex-direction: column;
`;

const ScrollBody = styled.div`
  display: flex;
  flex-direction: row;
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

  ${({ theme }) => theme.breakpoints.up('md')} {
    flex-direction: column;
    overflow: auto;
  }
`;

const SurveyResponseTile = ({ id, surveyName, dataTime, entityName, countryName }) => {
  const isMobile = useIsMobile();
  const tooltip = isMobile && (
    <>
      {surveyName}
      <br />
      {entityName}
    </>
  );

  return (
    <Tile
      Icon={SurveyTickIcon}
      text={entityName}
      title={surveyName}
      to={`?responseId=${id}`}
      tooltip={tooltip}
    >
      {countryName}, {displayDate(dataTime)}
    </Tile>
  );
};

export const SurveyResponsesSection = () => {
  const { data: recentSurveyResponses, isSuccess, isLoading } = useCurrentUserSurveyResponses();
  const { project } = useCurrentUserContext();

  return (
    <Container>
      <SectionHeading>Submission history</SectionHeading>
      <ScrollBody>
        {isLoading && <LoadingTile />}
        {isSuccess &&
          (recentSurveyResponses?.length > 0 ? (
            recentSurveyResponses.map(props => <SurveyResponseTile key={props.id} {...props} />)
          ) : (
            <Typography variant="body2" color="textSecondary">
              No recent surveys responses to display for {project?.name || 'project'}
            </Typography>
          ))}
      </ScrollBody>
    </Container>
  );
};
