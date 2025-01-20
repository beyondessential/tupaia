import { Typography } from '@material-ui/core';
import { parseISO } from 'date-fns';
import React from 'react';
import styled from 'styled-components';

import { useCurrentUserContext, useCurrentUserSurveyResponses } from '../../api';
import {
  BlockScrollView,
  DateTimeDisplay,
  InlineScrollView,
  SurveyTickIcon,
  Tile,
} from '../../components';
import { TileProps, TileSkeletons } from '../../components/Tile';
import { useIsMobile } from '../../utils';
import { SectionHeading } from './SectionHeading';

const Container = styled.section`
  display: grid;
  grid-area: --recentResponses;
  grid-template-columns: subgrid;
  grid-template-rows: auto 1fr;
`;

const InlineScroll = styled(InlineScrollView).attrs({
  $gap: '1rem',
  as: 'ul',
  role: 'list',
  size: '100%',
})``;
const BlockScroll = styled(BlockScrollView).attrs({
  $gap: '0.6rem',
  as: 'ul',
  role: 'list',
  size: '100%',
})``;

interface SurveyResponseTileProps extends TileProps {
  id: string;
  surveyName: string;
  dataTime: string;
  entityName: string;
  countryName: string;
}
const SurveyResponseTile = ({
  id,
  surveyName,
  dataTime,
  entityName,
  countryName,
}: SurveyResponseTileProps) => {
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
      heading={surveyName}
      leadingIcons={<SurveyTickIcon />}
      // TODO: Uncomment and de-hard-code when sync is implemented
      // trailingIcons={isWebApp() ? <SyncIndicator syncStatus="onlineOnly" /> : null}
      to={`?responseId=${id}`}
      tooltip={tooltip}
    >
      <p>{entityName}</p>
      <p>
        {countryName}, <DateTimeDisplay date={parseISO(dataTime)} variant="date" />
      </p>
    </Tile>
  );
};

export const SurveyResponsesSection = () => {
  const { data: recentSurveyResponses = [], isLoading } = useCurrentUserSurveyResponses();
  const { project } = useCurrentUserContext();

  const ScrollableList = useIsMobile() ? InlineScroll : BlockScroll;

  return (
    <Container>
      <SectionHeading>Submission history</SectionHeading>
      <ScrollableList>
        {isLoading ? (
          <TileSkeletons count={3} />
        ) : recentSurveyResponses.length > 0 ? (
          recentSurveyResponses.map(props => (
            <li key={props.id}>
              <SurveyResponseTile {...props} />
            </li>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No recent surveys responses to display for {project?.name || 'project'}
          </Typography>
        )}
      </ScrollableList>
    </Container>
  );
};
