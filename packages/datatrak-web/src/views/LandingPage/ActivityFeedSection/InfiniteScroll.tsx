/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';

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

export const InfiniteScroll = ({
  children,
  onScroll,
  hasNextPage,
  isFetchingNextPage,
}: InfiniteScrollProps) => {
  const loader = useRef<HTMLDivElement | null>(null);
  const container = useRef<HTMLDivElement | null>(null);

  const handleScroll = () => {
    if (!container.current || !loader.current || !hasNextPage) return;
    const isVisible = getIsAtEndOfList(container.current, loader?.current);
    if (isVisible && !isFetchingNextPage) onScroll();
  };

  useEffect(() => {
    // add scroll listener
    container?.current?.addEventListener('scroll', handleScroll);

    // remove scroll listener on unmount
    return () => {
      console.log('removing');
      container?.current?.removeEventListener('scroll', handleScroll);
    };
  }, [loader, container, hasNextPage]);

  return (
    <ScrollBody ref={container}>
      {children}
      {hasNextPage && <Loading ref={loader}>Loading more items</Loading>}
    </ScrollBody>
  );
};
