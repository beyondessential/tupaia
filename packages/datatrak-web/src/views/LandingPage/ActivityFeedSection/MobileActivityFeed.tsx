/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { HEADER_HEIGHT } from '../../../constants';
import { ActivityFeedList } from './ActivityFeedList';
import { useCurrentProjectActivityFeed } from '../../../api';
import { Button } from '../../../components';
import { Dialog, Slide } from '@material-ui/core';
import { TransitionProps } from '@material-ui/core/transitions';
import { StickyMobileHeader } from '../../../layout';
import { InfiniteActivityFeed } from './InfiniteActivityFeed';

const Wrapper = styled.div`
  ${({ theme }) => theme.breakpoints.up('md')} {
    display: none;
  }
`;

const ViewMoreButton = styled(Button).attrs({ variant: 'text', color: 'default' })`
  float: right;
  padding-block-start: 1rem;
`;

const ExpandedWrapper = styled.div`
  height: 100%;
`;

const InfiniteListWrapper = styled.div`
  margin-top: ${HEADER_HEIGHT};
  display: flex;
  overflow: hidden;
  flex-direction: column;
  max-height: calc(100vh - ${HEADER_HEIGHT});
  background-color: ${({ theme }) => theme.palette.divider};
`;

/**
 * Taken from [Material UI's example](https://v4.mui.com/components/dialogs/#full-screen-dialogs) to make the dialog slide up from the bottom
 */
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ExpandedList = ({ expanded, onClose }: { expanded: boolean; onClose: () => void }) => {
  return (
    <Dialog
      open={expanded}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      fullScreen
    >
      <ExpandedWrapper>
        <StickyMobileHeader onBack={onClose} title="Activity feed" />
        <InfiniteListWrapper>
          <InfiniteActivityFeed />
        </InfiniteListWrapper>
      </ExpandedWrapper>
    </Dialog>
  );
};

export const MobileActivityFeed = () => {
  const [expanded, setExpanded] = useState(false);
  const { data: activityFeed, hasNextPage } = useCurrentProjectActivityFeed();
  // Only show first page of items on mobile when not expanded
  const firstPageItems = activityFeed?.pages[0]?.items ?? [];
  return (
    <Wrapper>
      <ActivityFeedList items={firstPageItems} />
      {hasNextPage && (
        <ViewMoreButton onClick={() => setExpanded(true)}>View activity feed...</ViewMoreButton>
      )}
      <ExpandedList expanded={expanded} onClose={() => setExpanded(false)} />
    </Wrapper>
  );
};
