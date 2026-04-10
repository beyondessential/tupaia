import { Typography } from '@material-ui/core';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { DatatrakWebSurveyResponsesRequest } from '@tupaia/types';

import { useCurrentUserRecentSurveys } from '../../api';
import { InlineScrollView, SurveyIcon, Tile, TileSkeleton } from '../../components';
import { TileProps } from '../../components/Tile';
import { useIsMobile } from '../../utils';
import { DraftExistsModal } from '../../features/Survey/hooks/DraftExistsModal';
import { useDraftExistsModal } from '../../features/Survey/hooks/useDraftExistsModal';
import { SectionHeading } from './SectionHeading';

const RecentSurveys = styled.section`
  display: grid;
  grid-area: --recentSurveys;
  grid-template-columns: subgrid;
  grid-template-rows: auto 1fr;

  .MuiSvgIcon-root {
    color: ${props => props.theme.palette.primary.main};
  }

  .MuiButtonBase-root {
    text-align: left;
  }
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

const TooltipText = styled.p`
  font-weight: normal;
  margin-block: 0;
  text-align: center;
  text-wrap: balance;
`;

interface RecentSurveyTileProps
  extends TileProps,
    Pick<
      DatatrakWebSurveyResponsesRequest.SurveyResponse,
      'surveyName' | 'surveyCode' | 'countryName' | 'countryCode'
    > {
  onClick: () => void;
}

const RecentSurveyTile = ({
  surveyName,
  surveyCode,
  countryName,
  countryCode,
  onClick,
  ...props
}: RecentSurveyTileProps) => {
  const isMobile = useIsMobile();
  const tooltip = isMobile ? undefined : <TooltipText>{surveyName}</TooltipText>;

  return (
    <Tile
      heading={surveyName}
      leadingIcons={<SurveyIcon />}
      onClick={onClick}
      tooltip={tooltip}
      {...props}
    >
      <Typography>{countryName}</Typography>
    </Tile>
  );
};

export const RecentSurveysSection = () => {
  const { data: recentSurveys = [], isLoading } = useCurrentUserRecentSurveys();
  const navigate = useNavigate();
  const { checkForDrafts, draftModalProps } = useDraftExistsModal({
    onStartNew: (countryCode, surveyCode) => navigate(`/survey/${countryCode}/${surveyCode}/1`),
    onResume: resumePath => navigate(resumePath),
  });

  const handleSurveyClick = (countryCode: string, surveyCode: string) => {
    if (!checkForDrafts(countryCode, surveyCode)) {
      navigate(`/survey/${countryCode}/${surveyCode}/1`);
    }
  };

  const ScrollableList = useIsMobile() ? InlineScroll : GridScroll;

  const renderContents = () => {
    if (isLoading) return <TileSkeleton lineCount={1} />;

    if (recentSurveys.length > 0)
      return recentSurveys.map(({ countryId: _, ...props }) => (
        <li key={`${props.surveyCode}-${props.countryName}`}>
          <RecentSurveyTile
            {...props}
            onClick={() => handleSurveyClick(props.countryCode, props.surveyCode)}
          />
        </li>
      ));

    return (
      <Typography variant="body2" color="textSecondary">
        No recent surveys to display
      </Typography>
    );
  };

  return (
    <RecentSurveys>
      <SectionHeading>Top surveys</SectionHeading>
      <ScrollableList>{renderContents()}</ScrollableList>
      <DraftExistsModal {...draftModalProps} />
    </RecentSurveys>
  );
};
