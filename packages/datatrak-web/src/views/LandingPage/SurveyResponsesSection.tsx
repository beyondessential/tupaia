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

export const SurveyResponsesSection = () => {
  const { data: recentSurveyResponses, isSuccess, isLoading } = useCurrentUserSurveyResponses();
  const isMobile = useIsMobile();
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
                    !isMobile ? (
                      <>
                        {surveyName}
                        <br />
                        {entityName}
                      </>
                    ) : null
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
