/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import RoomIcon from '@material-ui/icons/Room';
import { SelectList } from '../../../components';

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow: auto;
  margin-top: 0.9rem;
`;

const SubListWrapper = styled.div`
  & + & {
    margin-block-start: 0.5rem;
  }
`;

const Subtitle = styled(Typography).attrs({
  variant: 'h3',
})`
  font-size: 0.9375rem;
  margin-block-end: 0.2rem;
`;

export const ResultItem = ({ name, parentName }) => {
  return (
    <>
      {name} | <span className="text-secondary">{parentName}</span>
    </>
  );
};

export const ResultsList = ({ value, searchResults, onSelect }) => {
  const getEntitiesList = (returnRecentEntities?: boolean) => {
    const entities = searchResults?.filter(({ isRecent }) =>
      returnRecentEntities ? isRecent : !isRecent,
    );
    return entities?.map(({ name, parentName, code, id }) => ({
      content: <ResultItem name={name} parentName={parentName} />,
      value: id,
      code,
      selected: id === value,
      icon: <RoomIcon />,
      button: true,
    }));
  };
  const recentEntities = getEntitiesList(true);
  const displayResults = getEntitiesList(false);

  return (
    <ListWrapper>
      {recentEntities?.length > 0 && (
        <SubListWrapper>
          <Subtitle>Recent entities</Subtitle>
          <SelectList items={recentEntities} onSelect={onSelect} variant="fullPage" />
        </SubListWrapper>
      )}
      <SubListWrapper>
        <Subtitle>All entities</Subtitle>
        <SelectList items={displayResults} onSelect={onSelect} variant="fullPage" />
      </SubListWrapper>
    </ListWrapper>
  );
};
