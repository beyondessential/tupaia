/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { SearchBar } from './SearchBar';
import { EntityList } from './EntityList';

const Wrapper = styled.div`
  display: none;
  flex-direction: column;
  align-items: center;
  margin-right: 1rem;
  margin-top: 0.6rem;
  width: 19rem;
  @media screen and (min-width: ${({ theme }) => theme.breakpoints.values.md}px) {
    display: flex;
  }
`;

const ResultsWrapper = styled.div`
  background: ${({ theme }) => theme.palette.background.default};
  padding: 0 0.875rem 0.625rem;
  width: 100%;
`;

export const EntitySearch = () => {
  const [searchValue, setSearchValue] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const listIsVisible = true;
  // searchValue || isSearchFocused;

  return (
    <Wrapper>
      <SearchBar value={searchValue} onChange={setSearchValue} onFocusChange={setIsSearchFocused} />
      {listIsVisible && <ResultsWrapper>{searchValue ? null : <EntityList />}</ResultsWrapper>}
    </Wrapper>
  );
};
