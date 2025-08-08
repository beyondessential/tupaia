import React, { useState } from 'react';
import styled from 'styled-components';
import { ClickAwayListener } from '@material-ui/core';
import { useParams } from 'react-router-dom';
import { SearchBar } from './SearchBar';
import { EntityMenu } from './EntityMenu';
import { useEntities, useProject } from '../../api/queries';
import { MOBILE_BREAKPOINT, TOP_BAR_HEIGHT_MOBILE } from '../../constants';
import { SearchResults } from './SearchResults';
import { gaEvent } from '../../utils';

const Container = styled.div`
  display: flex;
  z-index: 1;
  flex-direction: column;
  align-items: center;
  margin-right: 1rem;
  margin-top: 0.6rem;
  width: 19rem;
  position: relative;
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    width: auto;
    margin: 0;
    position: initial;
  }
`;

const ResultsWrapper = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${({ theme }) => theme.palette.background.paper};
  padding: 0 0.3rem 0.625rem;
  width: calc(100% + 5px);
  border-radius: 8px;
  max-height: calc(100vh - 9rem);
  overflow-y: auto;

  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    width: 100%;
    top: ${TOP_BAR_HEIGHT_MOBILE};
    left: 0;
    right: 0;
    min-height: calc(100vh - ${TOP_BAR_HEIGHT_MOBILE});
    max-height: calc(100vh - ${TOP_BAR_HEIGHT_MOBILE});
    border-radius: 0;
    position: fixed;
  }
`;

export const EntitySearch = () => {
  const { projectCode } = useParams();
  const { data: project } = useProject(projectCode!);
  const { data: entities = [] } = useEntities(projectCode!, project?.entityCode);
  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => {
    setIsOpen(false);
    gaEvent('Search', 'Toggle Expand');
    setSearchValue('');
  };

  const expandSearchBar = () => {
    setIsOpen(true);
    gaEvent('Search', 'Toggle Expand');
  };

  const updateSearchValue = (value: string) => {
    setSearchValue(value);
    gaEvent('Search', 'Change Search');
  };

  const children = entities.filter(entity => entity.parentCode === project?.code);
  const grandChildren = entities.filter(entity => entity.parentCode !== project?.code);

  return (
    <ClickAwayListener onClickAway={onClose}>
      <Container>
        <SearchBar
          value={searchValue}
          onChange={updateSearchValue}
          onFocusChange={expandSearchBar}
          onClose={onClose}
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
    </ClickAwayListener>
  );
};
