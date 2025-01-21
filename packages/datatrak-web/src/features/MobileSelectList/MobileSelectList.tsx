import React from 'react';
import styled from 'styled-components';
import { List as MuiList, Typography } from '@material-ui/core';
import { ListItem } from './ListItem';
import { CountrySelectWrapper } from '../CountrySelector';
import { ListItemType } from '../useGroupedSurveyList';

const BaseList = styled(MuiList)`
  padding: 20px 25px;
  height: 100%;
  background: ${({ theme }) => theme.palette.background.default};

  ${CountrySelectWrapper} {
    margin-bottom: 1rem;

    .MuiOutlinedInput-notchedOutline {
      border: none;
    }

    .MuiInputBase-root .MuiSvgIcon-root {
      display: none;
    }
  }
`;

const CategoryTitle = styled(Typography)`
  margin: -0.5rem 0 0.8rem;
  padding-top: 1rem;
`;

const NoResultsMessage = styled(Typography)`
  padding: 0.8rem 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

interface SelectListProps {
  items?: ListItemType[];
  onSelect: (item: ListItemType) => void;
  CountrySelector: React.ReactNode;
}

const List = ({ parentItem, items, onSelect, CountrySelector }) => {
  const parentTitle = parentItem?.value;
  return (
    <BaseList>
      {CountrySelector}
      {parentTitle && <CategoryTitle>{parentTitle}</CategoryTitle>}
      {items?.map(item => (
        <ListItem item={item} onSelect={onSelect} key={item.value}>
          {item?.children && (
            <List
              parentItem={item}
              items={item.children}
              onSelect={onSelect}
              CountrySelector={CountrySelector}
            />
          )}
        </ListItem>
      ))}
    </BaseList>
  );
};

export const MobileSelectList = ({ items = [], onSelect, CountrySelector }: SelectListProps) => {
  return (
    <>
      {items.length === 0 ? (
        <NoResultsMessage>No items to display</NoResultsMessage>
      ) : (
        <BaseList>
          {CountrySelector}
          {items.map(item => (
            <ListItem item={item} onSelect={onSelect} key={item.value}>
              {item?.children && (
                <List
                  parentItem={item}
                  items={item.children}
                  onSelect={onSelect}
                  CountrySelector={CountrySelector}
                />
              )}
            </ListItem>
          ))}
        </BaseList>
      )}
    </>
  );
};
