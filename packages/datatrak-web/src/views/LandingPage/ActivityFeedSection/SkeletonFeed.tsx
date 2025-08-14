import React from 'react';
import styled from 'styled-components';
import { Skeleton } from '@material-ui/lab';

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
`;

const FeedItem = styled.div`
  padding-bottom: 1rem;
  &:not(:last-child) {
    margin-bottom: 0.5rem;
    border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  }
`;

const FeedItemHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  & > *:not(:last-child) {
    margin-right: 0.5rem;
  }
`;

export const SkeletonFeed = () => {
  return (
    <Wrapper>
      {Array.from({
        length: 6, // show max 6 items, as we will set overflow to hidden so if the screen is too short to show 6 items, the rest will be hidden
      }).map((_, i) => (
        <FeedItem key={i}>
          <FeedItemHeader>
            <Skeleton variant="circle" width={40} height={40} animation={false} />
            <div>
              <Skeleton variant="text" width={200} height={40} animation={false} />
              <Skeleton variant="text" width={200} height={20} animation={false} />
            </div>
          </FeedItemHeader>

          <Skeleton variant="text" width="100%" height={20} animation={false} />
          <Skeleton variant="rect" width="100%" height={50} animation={false} />
        </FeedItem>
      ))}
    </Wrapper>
  );
};
