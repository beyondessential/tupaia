/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, ClickAwayListener, ListItemProps } from '@material-ui/core';
import { Link, useParams } from 'react-router-dom';
import { SearchBar } from './SearchBar';
import { EntityMenu } from './EntityMenu';
import { useEntities, useProject, useEntitySearch } from '../../api/queries';
import { MOBILE_BREAKPOINT } from '../../constants';

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 1rem;
  margin-top: 0.6rem;
  width: 19rem;
`;

const ResultsWrapper = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: ${({ theme }) => theme.palette.background.default};
  padding: 0 0.3rem 0.625rem;
  width: calc(100% + 5px);
  border-radius: 8px;
  max-height: calc(100vh - 9rem);
  overflow-y: auto;

  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    // Todo: make mobile version of this
    position: fixed;
    top: 92px;
    left: 0;
    right: 0;
    bottom: 0;
    max-height: calc(100vh - 92px);
  }
`;

const SearchResults = styled.div`
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

const isMobile = () => {
  return window.innerWidth < parseInt(MOBILE_BREAKPOINT, 10);
};

export const EntitySearch = () => {
  const { projectCode } = useParams();
  const { data: project } = useProject(projectCode!);
  const { data: entities = [] } = useEntities(projectCode!, project?.entityCode);
  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { data: searchResults = [] } = useEntitySearch(projectCode, searchValue);

  console.log('data', searchResults);

  const onClose = () => {
    if (isMobile()) {
      setIsOpen(false);
    }
  };

  const children = entities.filter(entity => entity.parentCode === project?.code);
  const grandChildren = entities.filter(entity => entity.parentCode !== project?.code);

  return (
    <ClickAwayListener onClickAway={onClose}>
      <Wrapper>
        <SearchBar value={searchValue} onChange={setSearchValue} onFocusChange={setIsOpen} />
        {isOpen && (
          <ResultsWrapper>
            {searchValue ? (
              <SearchResults>
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
              </SearchResults>
            ) : (
              <EntityMenu
                projectCode={projectCode!}
                children={children}
                grandChildren={grandChildren}
                onClose={onClose}
              />
            )}
          </ResultsWrapper>
        )}
      </Wrapper>
    </ClickAwayListener>
  );
};
