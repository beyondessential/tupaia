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

  // threshold is a percentage of the loader's height that must be visible before we consider it to be in view
  const threshold = 0.2;

  return (
    loaderRect.top >= containerRect.top - loaderRect.height * threshold &&
    loaderRect.bottom <= containerRect.bottom + loaderRect.height * threshold
  );
};

interface InfiniteScrollProps {
  children: ReactNode;
  onScroll: () => void;
  hasNextPage?: boolean;
}

export const InfiniteScroll = ({ children, onScroll, hasNextPage }: InfiniteScrollProps) => {
  const loader = useRef<HTMLDivElement | null>(null);
  const container = useRef<HTMLDivElement | null>(null);

  const handleScroll = () => {
    if (!container.current || !loader.current || !hasNextPage) return;
    const isVisible = getIsAtEndOfList(loader.current, container.current);
    if (isVisible) onScroll();
  };

  useEffect(() => {
    // if there is no loader, there is no need to add a scroll listener
    if (!container.current || !loader.current || !hasNextPage) return;

    // add scroll listener
    container.current.addEventListener('scroll', handleScroll);

    // remove scroll listener on unmount
    return () => container.current?.removeEventListener('scroll', handleScroll);
  }, [loader, container, hasNextPage]);

  return (
    <ScrollBody ref={container}>
      {children}
      {hasNextPage && <Loading ref={loader}>Loading more items</Loading>}
    </ScrollBody>
  );
};
