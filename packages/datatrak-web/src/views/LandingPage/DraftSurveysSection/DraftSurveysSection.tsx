import React, { useRef } from 'react';
import styled from 'styled-components';
import { InlineScrollView } from '../../../components';
import { useIsMobile } from '../../../utils';
import { SectionHeading } from '../SectionHeading';
import { InfiniteScroll } from '../ActivityFeedSection/InfiniteScroll';
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

const ScrollContainer = styled(InfiniteScroll)`
  grid-column: 1 / -1;
  max-block-size: 10rem;
`;

interface DraftSurveysSectionProps {
  drafts: any[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetching: boolean;
}

export const DraftSurveysSection = ({
  drafts,
  fetchNextPage,
  hasNextPage,
  isFetching,
}: DraftSurveysSectionProps) => {
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <DraftSurveys>
      <SectionHeading>My drafts</SectionHeading>
      {isMobile ? (
        <InlineScroll>
          {drafts.map(draft => (
            <li key={draft.id}>
              <DraftSurveyTile {...draft} />
            </li>
          ))}
        </InlineScroll>
      ) : (
        <ScrollContainer
          ref={scrollRef}
          onScroll={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetching}
        >
          <GridScroll>
            {drafts.map(draft => (
              <li key={draft.id}>
                <DraftSurveyTile {...draft} />
              </li>
            ))}
          </GridScroll>
        </ScrollContainer>
      )}
      {isMobile && <MobileDraftSurveys drafts={drafts} />}
    </DraftSurveys>
  );
};
