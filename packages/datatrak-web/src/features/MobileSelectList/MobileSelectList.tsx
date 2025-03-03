import { List as MuiList, Typography } from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';

import { CountrySelectWrapper, CountrySelector } from '../CountrySelector';
import { ListItemType } from '../useGroupedSurveyList';
import { ListItem } from './ListItem';

const BaseList = styled(MuiList)`
  background: ${({ theme }) => theme.palette.background.default};
  block-size: 100%;
  padding-block: 1.25rem;
  padding-inline: 1.5rem;

  ${CountrySelectWrapper} {
    margin-block-end: 1rem;

    .MuiOutlinedInput-notchedOutline {
      border: none;
    }

    .MuiInputBase-root .MuiSvgIcon-root {
      display: none;
    }
  }
`;

const CategoryTitle = styled(Typography)`
  margin-block: -0.5rem 0.8rem;
  margin-inline: 0:
  padding-block-start: 1rem;
`;

const NoResultsMessage = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 0.875rem;
  padding-block: 0.8rem;
  padding-inline: 0.5rem;
`;

interface SelectListProps {
  items?: ListItemType[];
  onSelect: (item: ListItemType) => void;
}

const List = ({ parentItem, items, onSelect, countrySelector }) => {
  const parentTitle = parentItem?.value;
  return (
    <BaseList>
      {countrySelector}
      {parentTitle && <CategoryTitle>{parentTitle}</CategoryTitle>}
      {items?.map(item => (
        <ListItem item={item} onSelect={onSelect} key={item.value}>
          {item?.children && (
            <List
              parentItem={item}
              items={item.children}
              onSelect={onSelect}
              countrySelector={countrySelector}
            />
          )}
        </ListItem>
      ))}
    </BaseList>
  );
};

export const MobileSelectList = ({ items = [], onSelect }: SelectListProps) => {
  if (items.length === 0) {
    return <NoResultsMessage>No items to display</NoResultsMessage>;
  }

  const countrySelector = <CountrySelector />;

  return (
    <BaseList>
      {countrySelector}
      {items.map(item => (
        <ListItem item={item} onSelect={onSelect} key={item.value}>
          {item?.children && (
            <List
              parentItem={item}
              items={item.children}
              onSelect={onSelect}
              countrySelector={countrySelector}
            />
          )}
        </ListItem>
      ))}
    </BaseList>
  );
};
