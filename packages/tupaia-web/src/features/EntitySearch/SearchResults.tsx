/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { Button, ListItemProps, CircularProgress } from '@material-ui/core';
import styled from 'styled-components';
import { FlexColumn } from '@tupaia/ui-components';
import { Link, useParams } from 'react-router-dom';
import { useEntitySearch } from '../../api/queries';

const Container = styled.div`
  padding: 1rem;
`;

const ResultLink = styled(Button).attrs({
  component: Link,
})<ListItemProps>`
  display: block;
  text-transform: none;
  padding: 0.8rem;
  font-size: 0.875rem;
`;

const MessageBody = styled(FlexColumn)`
  padding: 1rem;
  min-height: 7rem;
  align-items: center;
  justify-content: center;

  .MuiCircularProgress-root {
    margin-bottom: 1.5rem;
  }
`;

const Loader = () => {
  return (
    <MessageBody>
      <CircularProgress />
      <div>Loading results...</div>
    </MessageBody>
  );
};

const ScrollBody = styled.div`
  overflow: auto;
  max-height: 20rem;
`;

const LoadMoreButton = styled(Button).attrs({
  variant: 'outlined',
  color: 'default',
})`
  display: block;
  width: 100%;
  padding: 0.6rem;
  margin-top: 0.6rem;
  font-size: 0.8125rem;
  text-transform: none;
`;

const NoDataMessage = ({ searchValue }: { searchValue: string }) => {
  return <MessageBody>No results found for search "{searchValue}"</MessageBody>;
};

interface SearchResultsProps {
  searchValue: string;
  onClose: () => void;
}

const PAGE_LENGTHS = {
  INITIAL: 5,
  LOAD_MORE: 5,
  MAX: 20,
};
export const SearchResults = ({ searchValue, onClose }: SearchResultsProps) => {
  const { projectCode } = useParams();
  const [prevSearchValue, setPrevSearchValue] = useState(searchValue);
  const [pageSize, setPageSize] = useState(PAGE_LENGTHS.INITIAL);

  const { data: searchResults = [], isLoading } = useEntitySearch(
    projectCode,
    searchValue,
    pageSize,
  );

  if (searchValue !== prevSearchValue) {
    setPrevSearchValue(searchValue);
    setPageSize(PAGE_LENGTHS.INITIAL);
  }

  if (isLoading) {
    return <Loader />;
  }

  if (searchResults.length === 0) {
    return <NoDataMessage searchValue={searchValue} />;
  }

  const onLoadMore = () => {
    setPageSize(pageSize + PAGE_LENGTHS.LOAD_MORE);
  };

  return (
    <Container>
      <ScrollBody>
        {searchResults.map(({ code, name }) => {
          return (
            <ResultLink
              key={code}
              onClick={onClose}
              to={{ ...location, pathname: `/${projectCode}/${code}` }}
            >
              {name}
            </ResultLink>
          );
        })}
      </ScrollBody>
      {pageSize < PAGE_LENGTHS.MAX && (
        <LoadMoreButton onClick={onLoadMore}>Load more results</LoadMoreButton>
      )}
    </Container>
  );
};
