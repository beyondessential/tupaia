/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Button, ListItemProps, CircularProgress } from '@material-ui/core';
import styled from 'styled-components';
import { FlexColumn } from '@tupaia/ui-components';
import { Link, useParams } from 'react-router-dom';
import { useEntitySearch } from '../../api/queries';

const ResultLink = styled(Button).attrs({
  component: Link,
})<ListItemProps>`
  display: block;
  text-transform: none;
  padding: 0.8rem;
  font-size: 0.875rem;
`;

const Container = styled.div`
  padding: 1rem;
`;

const Body = styled(FlexColumn)`
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
    <Body>
      <CircularProgress />
      <div>Loading results...</div>
    </Body>
  );
};

const NoDataMessage = ({ searchValue }: { searchValue: string }) => {
  return <Body>No results found for search "{searchValue}"</Body>;
};

interface SearchResultsProps {
  searchValue: string;
  onClose: () => void;
}
export const SearchResults = ({ searchValue, onClose }: SearchResultsProps) => {
  const { projectCode } = useParams();
  const { data: searchResults = [], isLoading } = useEntitySearch(projectCode, searchValue);

  if (isLoading) {
    return <Loader />;
  }

  if (searchResults.length === 0) {
    return <NoDataMessage searchValue={searchValue} />;
  }

  // Load more button
  return (
    <Container>
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
    </Container>
  );
};
