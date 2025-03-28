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

const TooltipText = styled.p`
  font-weight: normal;
  margin-block: 0;
  text-align: center;
  text-wrap: balance;
`;

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
  const tooltip = (
    <>
      <TooltipText>{surveyName}</TooltipText>
      <TooltipText>{entityName}</TooltipText>
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

  const renderContents = () => {
    if (isLoading) return <TileSkeletons count={3} />;

    if (recentSurveyResponses.length > 0)
      return recentSurveyResponses.map(props => (
        <li key={props.id}>
          <SurveyResponseTile {...props} />
        </li>
      ));

    return (
      <Typography variant="body2" color="textSecondary">
        No recent surveys responses to display for {project?.name || 'project'}
      </Typography>
    );
  };

  return (
    <Container>
      <SectionHeading>Submission history</SectionHeading>
      <ScrollableList>{renderContents()}</ScrollableList>
    </Container>
  );
};
