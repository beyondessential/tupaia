import { Typography } from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';

import { DatatrakWebSurveyResponsesRequest } from '@tupaia/types';

import { useCurrentUserRecentSurveys } from '../../api';
import { InlineScrollView, SurveyIcon, Tile, TileSkeleton } from '../../components';
import { TileProps } from '../../components/Tile';
import { useIsMobile } from '../../utils';
import { SectionHeading } from './SectionHeading';

const RecentSurveys = styled.section`
  display: grid;
  grid-area: --recentSurveys;
  grid-template-columns: subgrid;
`;

const InlineScroll = styled(InlineScrollView).attrs({
  $gap: '1rem',
  as: 'ul',
  role: 'list',
})``;
const GridScroll = styled.div.attrs({
  as: 'ul',
  role: 'list',
})`
  column-gap: 1rem;
  display: grid;
  grid-auto-flow: row;
  grid-template-columns: subgrid;
  row-gap: 0.6rem;
  grid-column: 1 / -1;
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
      heading={surveyName}
      leadingIcons={<SurveyIcon />}
      to={`/survey/${countryCode}/${surveyCode}/1`}
      tooltip={tooltip}
      {...props}
    >
      {countryName}
    </Tile>
  );
};

export const RecentSurveysSection = () => {
  const { data: recentSurveys = [], isSuccess, isLoading } = useCurrentUserRecentSurveys();

  const ScrollableList = useIsMobile() ? InlineScroll : GridScroll;

  return (
    <RecentSurveys>
      <SectionHeading>Top surveys</SectionHeading>
      <ScrollableList>
        {isLoading ? (
          <TileSkeleton lineCount={1} />
        ) : recentSurveys.length > 0 ? (
          recentSurveys.map(props => (
            <li key={`${props.surveyCode}-${props.countryName}`}>
              <RecentSurveyTile {...props} />
            </li>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No recent surveys to display
          </Typography>
        )}
      </ScrollableList>
    </RecentSurveys>
  );
};
