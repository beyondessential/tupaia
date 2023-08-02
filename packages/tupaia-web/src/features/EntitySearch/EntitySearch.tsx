/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useRef } from 'react';
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
  $mobileIsActive: boolean;
}>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 1rem;
  margin-top: 0.6rem;
  width: 19rem;

  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: ${({ $mobileIsActive }) => ($mobileIsActive ? 'flex' : 'none')};
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

const MobileOpenButton = styled(IconButton)`
  display: none;
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: block;
  }
`;

const MobileCloseButton = styled(IconButton)`
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
  const inputRef = useRef(null);
  const { data: project } = useProject(projectCode!);
  const { data: entities = [] } = useEntities(projectCode!, project?.entityCode);
  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [mobileIsActive, setMobileIsActive] = useState(false);
  const onClose = () => {
    setIsOpen(false);
    setMobileIsActive(false);
    setSearchValue('');
  };

  const onClickMobileOpen = () => {
    console.log('click mobile open', inputRef.current);
    setMobileIsActive(true);
    inputRef.current?.focus();
  };

  const onClickMobileClose = () => {
    if (isOpen) {
      setIsOpen(false);
    } else if (!isOpen && searchValue.length > 0) {
      setSearchValue('');
    } else if (!isOpen && searchValue.length === 0) {
      setMobileIsActive(false);
    }
  };

  const children = entities.filter(entity => entity.parentCode === project?.code);
  const grandChildren = entities.filter(entity => entity.parentCode !== project?.code);

  return (
    <ClickAwayListener onClickAway={onClose}>
      <div>
        <MobileOpenButton onClick={onClickMobileOpen} color="default">
          <Search />
        </MobileOpenButton>
        <Container $mobileIsActive={mobileIsActive}>
          <MobileCloseButton onClick={onClickMobileClose} color="default">
            <Close />
          </MobileCloseButton>
          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
            onFocusChange={setIsOpen}
            ref={inputRef}
          />
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
      </div>
    </ClickAwayListener>
  );
};
