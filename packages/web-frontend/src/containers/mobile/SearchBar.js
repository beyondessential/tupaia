/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import SearchIcon from '@material-ui/icons/Search';

import SearchOverlay from './SearchOverlay';

const SearchBarContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  padding: 10px 0px;
`;

const SearchBarButton = styled(Button)`
  border-radius: 43px;
  display: flex;
  flex: 1;
  text-transform: none;
  justify-content: flex-start;
  background-color: #202124;
  margin: 10px 20px;
  padding-left: 20px;

  .MuiButton-label {
    opacity: 0.6;
  }
`;

export const SearchBar = () => {
  const [isSearchActive, setIsSearchActive] = useState(false);

  return (
    <SearchBarContainer>
      <SearchBarButton startIcon={<SearchIcon />} onClick={() => setIsSearchActive(true)}>
        Search location
      </SearchBarButton>
      {isSearchActive && <SearchOverlay onClose={() => setIsSearchActive(false)} />}
    </SearchBarContainer>
  );
};
