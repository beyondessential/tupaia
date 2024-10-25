/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { List as MuiList, Typography } from '@material-ui/core';
import { ListItem } from './ListItem';

type ListItemType = Record<string, string>;

const Container = styled.div``;

const NoResultsMessage = styled(Typography)`
  padding: 0.8rem 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

interface SelectListProps {
  items?: ListItemType[];
  onSelect: (item: ListItemType) => void;
  noResultsMessage?: string;
}

const List = ({ items, onSelect }) => {
  return (
    <MuiList disablePadding>
      {items?.map(item => (
        <ListItem item={item} onSelect={onSelect} key={item.value}>
          {item?.children && <List items={item.children} onSelect={onSelect} />}
        </ListItem>
      ))}
    </MuiList>
  );
};

export const MobileSelectList = ({
  items = [],
  onSelect,
  noResultsMessage = 'No items to display',
}: SelectListProps) => {
  return (
    <Container>
      {items.length === 0 ? (
        <NoResultsMessage>{noResultsMessage}</NoResultsMessage>
      ) : (
        <List items={items} onSelect={onSelect} />
      )}
    </Container>
  );
};
