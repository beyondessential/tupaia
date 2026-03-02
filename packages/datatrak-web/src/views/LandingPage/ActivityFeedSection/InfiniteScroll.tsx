import { Typography } from '@material-ui/core';
import React, { ReactNode, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';

const ScrollBody = styled.div`
  overflow: auto;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Loading = styled(Typography).attrs({
  variant: 'body2',
  color: 'textSecondary',
})`
  text-align: center;
  padding: 1rem;
`;

const getIsAtEndOfList = (container?: HTMLDivElement, loader?: HTMLDivElement) => {
  if (!container || !loader) return false;
  const loaderRect = loader.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  return (
    loaderRect.top >= containerRect.top - loaderRect.height &&
    loaderRect.bottom <= containerRect.bottom + loaderRect.height
  );
};

interface InfiniteScrollProps {
  children: ReactNode;
  onScroll: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

export const InfiniteScroll = React.forwardRef<HTMLDivElement, InfiniteScrollProps>(
  ({ children, onScroll, hasNextPage, isFetchingNextPage }: InfiniteScrollProps, containerRef) => {
    const loader = useRef<HTMLDivElement | null>(null);

    const handleScroll = useCallback(() => {
      const refElement = (containerRef as React.MutableRefObject<HTMLDivElement | null>)?.current;
      if (!refElement || !loader.current || !hasNextPage) return;
      const isVisible = getIsAtEndOfList(refElement, loader.current);
      if (isVisible && !isFetchingNextPage) onScroll();
    }, [containerRef, hasNextPage, isFetchingNextPage, onScroll]);

    useEffect(() => {
      const refElement = (containerRef as React.MutableRefObject<HTMLDivElement | null>)?.current;
      if (!refElement || !loader.current) return;

      refElement.addEventListener('scroll', handleScroll);
      return () => {
        refElement.removeEventListener('scroll', handleScroll);
      };
    }, [containerRef, handleScroll]);

    return (
      <ScrollBody ref={containerRef}>
        {children}
        {hasNextPage && <Loading ref={loader}>Loading more items…</Loading>}
      </ScrollBody>
    );
  },
);
