import React from 'react';
import styled from 'styled-components';
import { useSurveyResponseDrafts } from '../../../api';
import { InlineScrollView, TileSkeleton } from '../../../components';
import { useIsMobile } from '../../../utils';
import { SectionHeading } from '../SectionHeading';
import { MobileDraftSurveys } from './MobileDraftSurveys';
import { DraftSurveyTile } from './DraftSurveyTile';

const DraftSurveys = styled.section`
  display: grid;
  grid-area: --draftSurveys;
  grid-template-columns: subgrid;
  grid-template-rows: auto 1fr;
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

export const DraftSurveysSection = () => {
  const { data: drafts = [], isLoading } = useSurveyResponseDrafts();
  const isMobile = useIsMobile();

  if (!isLoading && drafts.length === 0) return null;

  const ScrollableList = isMobile ? InlineScroll : GridScroll;

  const renderContents = () => {
    if (isLoading) return <TileSkeleton lineCount={1} />;

    return drafts.map(draft => (
      <li key={draft.id}>
        <DraftSurveyTile {...draft} />
      </li>
    ));
  };

  return (
    <DraftSurveys>
      <SectionHeading>My drafts</SectionHeading>
      <ScrollableList>{renderContents()}</ScrollableList>
      {isMobile && !isLoading && <MobileDraftSurveys drafts={drafts} />}
    </DraftSurveys>
  );
};
