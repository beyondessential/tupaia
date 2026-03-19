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
  grid-template-columns: repeat(3, 1fr);
  row-gap: 0.6rem;
`;

const ScrollContainer = styled(InfiniteScroll)`
  grid-column: 1 / -1;
  max-block-size: 9rem;
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
          {drafts.slice(0, 6).map(draft => (
            <DraftSurveyTile {...draft} key={draft.id} variant="mobile-scroll" />
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
                <DraftSurveyTile {...draft} variant="desktop" />
              </li>
            ))}
          </GridScroll>
        </ScrollContainer>
      )}
      {isMobile && <MobileDraftSurveys drafts={drafts} />}
    </DraftSurveys>
  );
};
