/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { ClickAwayListener } from '@material-ui/core';
import { useParams } from 'react-router-dom';
import { Close, Search } from '@material-ui/icons';
import { SearchBar } from './SearchBar';
import { EntityMenu } from './EntityMenu';
import { useEntities, useProject } from '../../api/queries';
import { MOBILE_BREAKPOINT, TOP_BAR_HEIGHT_MOBILE } from '../../constants';

import { SearchResults } from './SearchResults';
import { IconButton } from '@tupaia/ui-components';

const Container = styled.div<{
  $isActive: boolean;
}>`
  position: relative;
  //display: flex;
  display: ${({ $isActive }) => ($isActive ? 'flex' : 'none')};
  flex-direction: column;
  align-items: center;
  margin-right: 1rem;
  margin-top: 0.6rem;
  width: 19rem;

  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: ${({ $isActive }) => ($isActive ? 'flex' : 'none')};
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    bottom: 0;
    margin-top: 0;
    // Place on top of the hamburger menu on mobile
    z-index: 1;
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
  max-height: calc(100vh - 9rem);
  overflow-y: auto;

  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    position: fixed;
    top: ${TOP_BAR_HEIGHT_MOBILE};
    left: 0;
    right: 0;
    min-height: calc(100vh - ${TOP_BAR_HEIGHT_MOBILE});
    max-height: calc(100vh - ${TOP_BAR_HEIGHT_MOBILE});
    border-radius: 0;
  }
`;

const OpenButton = styled(IconButton)`
  display: none;
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: block;
  }
`;

const CloseButton = styled(IconButton)`
  display: none;
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: block;
    position: absolute;
    top: 0.1rem;
    right: 0.1rem;
    z-index: 1;
  }
`;

export const EntitySearch = () => {
  const { projectCode } = useParams();
  const { data: project } = useProject(projectCode!);
  const { data: entities = [] } = useEntities(projectCode!, project?.entityCode);
  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const onClose = () => {
    if (!isOpen) {
      setIsActive(false);
    } else if (searchValue.length === 0) {
      setIsOpen(false);
    } else {
      setSearchValue('');
    }
  };

  const children = entities.filter(entity => entity.parentCode === project?.code);
  const grandChildren = entities.filter(entity => entity.parentCode !== project?.code);

  return (
    <ClickAwayListener onClickAway={onClose}>
      <>
        <OpenButton onClick={() => setIsActive(true)} color="default">
          <Search />
        </OpenButton>
        <Container $isActive={isActive}>
          <CloseButton onClick={onClose} color="default">
            <Close />
          </CloseButton>
          <SearchBar value={searchValue} onChange={setSearchValue} onFocusChange={setIsOpen} />
          {isOpen && (
            <ResultsWrapper>
              {searchValue ? (
                <SearchResults searchValue={searchValue} onClose={onClose} />
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
        </Container>
      </>
    </ClickAwayListener>
  );
};
