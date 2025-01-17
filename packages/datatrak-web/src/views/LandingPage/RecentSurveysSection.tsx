import { Typography } from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';
import { LoadingTile, SurveyIcon, Tile } from '../../components';

import { useCurrentUserRecentSurveys } from '../../api';
import { TileProps } from '../../components/Tile';
import { useIsMobile } from '../../utils';
import { SectionHeading } from './SectionHeading';

const RecentSurveys = styled.section`
  display: flex;
  flex-direction: column;
  grid-area: --recentSurveys;
`;

const ScrollBody = styled.div<{
  $hasMultiple: boolean;
}>`
  --_column-gap: 1rem;
  display: flex;
  overflow-x: auto;
  gap: 0.6rem var(--_column-gap);

  > :is(a, span) {
    inline-size: 18rem;
    max-inline-size: 100%;
    flex: initial;
  }

  ${({ theme }) => theme.breakpoints.up('md')} {
    display: grid;
    grid-template-rows: 1fr;
    grid-auto-flow: row;
    grid-template-columns: ${({ $hasMultiple }) =>
      $hasMultiple
        ? 'repeat(auto-fill, minmax(calc(33.3% - var(--_column-gap)), 1fr))'
        : 'initial'};
  }
`;

type RecentSurveyTileProps = TileProps &
  Pick<
    DatatrakWebSurveyResponsesRequest.SurveyResponse,
    'surveyName' | 'surveyCode' | 'countryName' | 'countryCode'
  >;

const RecentSurveyTile = ({
  surveyName,
  surveyCode,
  countryName,
  countryCode,
  ...props
}: RecentSurveyTileProps) => {
  const isMobile = useIsMobile();
  const tooltip = isMobile ? (
    <>
      {surveyName}
      <br />
      {countryName}
    </>
  ) : null;

  return (
    <Tile
      Icon={SurveyIcon}
      text={countryName}
      title={surveyName}
      to={`/survey/${countryCode}/${surveyCode}/1`}
      tooltip={tooltip}
      {...props}
    />
  );
};

export const RecentSurveysSection = () => {
  const { data: recentSurveys = [], isSuccess, isLoading } = useCurrentUserRecentSurveys();

  return (
    <RecentSurveys>
      <SectionHeading>Top surveys</SectionHeading>
      <ScrollBody $hasMultiple={recentSurveys.length > 1}>
        {isLoading && <LoadingTile />}
        {isSuccess &&
          (recentSurveys?.length > 0 ? (
            recentSurveys.map(props => (
              <RecentSurveyTile key={`${props.surveyCode}-${props.countryName}`} {...props} />
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No recent surveys to display
            </Typography>
          ))}
      </ScrollBody>
    </RecentSurveys>
  );
};
