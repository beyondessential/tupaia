/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { List as MuiList } from '@material-ui/core';
import { ListItem as Item, ListItemType } from './ListItem';

interface SelectListProps {
  items?: ListItemType[];
  onSelect: (item: ListItemType) => void;
  ListItem?: React.ReactNode;
}

export const List = ({ items, onSelect, ListItem = Item }: SelectListProps) => {
  return (
    <MuiList disablePadding>
      {items?.map(item => (
        // @ts-ignore
        <ListItem item={item} onSelect={onSelect} key={item.value}>
          {item?.children && <List items={item.children} onSelect={onSelect} />}
        </ListItem>
      ))}
    </MuiList>
  );
};
