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

/**
 * Whether the element is laid out and visible. A list hidden with `display: none`, or inside a
 * closed dialog, has no real geometry: every rect reads as zero.
 */
const isRendered = (element: HTMLElement) => {
  if (typeof element.checkVisibility === 'function') {
    return element.checkVisibility({ checkVisibilityCSS: true });
  }
  return element.getClientRects().length > 0;
};

export const getIsAtEndOfList = (container?: HTMLElement | null, loader?: HTMLElement | null) => {
  if (!container || !loader) return false;
  // A hidden list's zero rects would otherwise always read as "at the end", and since each fetch
  // re-runs the check, every page would be loaded and rendered in turn. On a project with a long
  // feed, that runs a phone's page out of memory
  if (!isRendered(container)) return false;
  const containerRect = container.getBoundingClientRect();
  if (containerRect.height === 0) return false;
  const loaderRect = loader.getBoundingClientRect();

  return (
    loaderRect.top >= containerRect.top - loaderRect.height &&
    loaderRect.bottom <= containerRect.bottom + loaderRect.height
  );
};

interface InfiniteScrollProps {
  children: ReactNode;
  className?: string;
  onScroll: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

export const InfiniteScroll = React.forwardRef<HTMLDivElement, InfiniteScrollProps>(
  (
    { children, className, onScroll, hasNextPage, isFetchingNextPage }: InfiniteScrollProps,
    containerRef,
  ) => {
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

      // Check if the loader is already visible on mount (content doesn't overflow)
      handleScroll();

      refElement.addEventListener('scroll', handleScroll);
      return () => {
        refElement.removeEventListener('scroll', handleScroll);
      };
    }, [containerRef, handleScroll]);

    return (
      <ScrollBody ref={containerRef} className={className}>
        {children}
        {hasNextPage && <Loading ref={loader}>Loading more items…</Loading>}
      </ScrollBody>
    );
  },
);
