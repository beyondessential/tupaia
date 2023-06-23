/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { SearchBar } from './SearchBar';
import { EntityMenu } from './EntityMenu';

const Wrapper = styled.div`
  position: relative;
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
  position: absolute;
  top: 100%;
  left: 0;
  background: ${({ theme }) => theme.palette.background.default};
  padding: 0 0.3rem 0.625rem;
  width: calc(100% + 5px);
  border-radius: 8px;
  max-height: calc(80vh - 12rem);
  overflow-y: auto;
`;

export const EntitySearch = () => {
  const [searchValue, setSearchValue] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const listIsVisible = searchValue || isSearchFocused;

  return (
    <Wrapper>
      <SearchBar value={searchValue} onChange={setSearchValue} onFocusChange={setIsSearchFocused} />
      {listIsVisible && <ResultsWrapper>{searchValue ? null : <EntityMenu />}</ResultsWrapper>}
    </Wrapper>
  );
};
