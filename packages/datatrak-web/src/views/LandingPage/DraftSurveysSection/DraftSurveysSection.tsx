import React from 'react';
import styled from 'styled-components';
import { InlineScrollView } from '../../../components';
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

const GridScroll = styled.ul.attrs({
  role: 'list',
})`
  column-gap: 1rem;
  display: grid;
  grid-auto-flow: row;
  grid-template-columns: subgrid;
  row-gap: 0.6rem;
  grid-column: 1 / -1;
`;

export const DraftSurveysSection = ({ drafts }) => {
  const isMobile = useIsMobile();
  const ScrollableList = (isMobile ? InlineScroll : GridScroll) as React.ElementType;

  return (
    <DraftSurveys>
      <SectionHeading>My drafts</SectionHeading>
      <ScrollableList>
        {drafts.map(draft => (
          <li key={draft.id}>
            <DraftSurveyTile {...draft} />
          </li>
        ))}
      </ScrollableList>
      {isMobile && <MobileDraftSurveys drafts={drafts} />}
    </DraftSurveys>
  );
};
