import React, { useRef } from 'react';
import styled from 'styled-components';
import { InfiniteActivityFeed } from './InfiniteActivityFeed';

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  overflow: hidden;
  flex: 1;
  ${({ theme }) => theme.breakpoints.down('sm')} {
    display: none;
  }
`;

export const DesktopActivityFeed = () => {
  const feedRef = useRef<HTMLDivElement | null>(null);
  return (
    <Wrapper>
      <InfiniteActivityFeed ref={feedRef} />
    </Wrapper>
  );
};
