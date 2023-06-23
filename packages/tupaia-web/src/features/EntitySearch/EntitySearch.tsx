/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { ClickAwayListener } from '@material-ui/core';
import { SearchBar } from './SearchBar';
import { EntityMenu } from './EntityMenu';
import { useParams } from 'react-router-dom';
import { useEntities } from '../../api/queries';

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

const SearchResults = styled.div`
  padding: 1rem;
  display: flex;
`;

export const EntitySearch = () => {
  const { projectCode, entityCode } = useParams();
  const { data, isLoading } = useEntities(projectCode!, entityCode!);
  const [searchValue, setSearchValue] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <ClickAwayListener onClickAway={() => setIsSearchFocused(false)}>
      <Wrapper>
        <SearchBar
          value={searchValue}
          onChange={setSearchValue}
          onFocusChange={setIsSearchFocused}
        />
        {isSearchFocused && (
          <ResultsWrapper>
            {searchValue ? (
              <SearchResults>{searchValue}</SearchResults>
            ) : (
              <EntityMenu
                projectCode={projectCode!}
                children={data?.children || []}
                isLoading={isLoading}
              />
            )}
          </ResultsWrapper>
        )}
      </Wrapper>
    </ClickAwayListener>
  );
};
