/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import RoomIcon from '@material-ui/icons/Room';
import { BaseListItem, SelectList } from '../../../components';

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

const IconWrapper = styled.div`
  padding-right: 0.5rem;
  display: flex;
  align-items: center;
  width: 1.8rem;
  margin-left: -0.5rem;

  .MuiSvgIcon-root {
    color: ${({ theme }) => theme.palette.primary.dark};
    font-size: 1.5rem;
  }
`;

const ListItem = ({ item, onSelect }) => {
  const { name, parentName, selected } = item;
  const onClick = () => {
    onSelect(item);
  };

  return (
    <BaseListItem button onClick={onClick} selected={selected}>
      <IconWrapper>
        <RoomIcon />
      </IconWrapper>
      {name} | <span className="text-secondary">{parentName}</span>
    </BaseListItem>
  );
};

export const ResultsList = ({ searchResults, onSelect }) => {
  return (
    <ListWrapper>
      <SelectList items={searchResults} onSelect={onSelect} ListItem={ListItem} />
    </ListWrapper>
  );
};
