import React from 'react';
import { List as MuiList } from '@material-ui/core';
import { ListItem as Item, ListItemSkeleton } from './ListItem';
import { ListItemType } from './types';

interface SelectListProps {
  items?: ListItemType[];
  onSelect: (item: ListItemType) => void;
  ListItem?: React.ElementType;
}

export const List = ({ items, onSelect, ListItem = Item }: SelectListProps) => {
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

export const ListSkeleton = ({ length = 6 }: { length?: number }) => {
  const listItem = <ListItemSkeleton />;
  return <MuiList disablePadding>{Array.from({ length }).map(() => listItem)}</MuiList>;
};
