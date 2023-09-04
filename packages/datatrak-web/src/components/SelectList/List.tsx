/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { List as MuiList } from '@material-ui/core';
import { ListItem, ListItemType } from './ListItem';

interface SelectListProps {
  items?: ListItemType[];
  onSelect?: (item: ListItemType) => void;
}

export const List = ({ items, onSelect }: SelectListProps) => {
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
