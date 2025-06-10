import { List as MuiList, Typography } from '@material-ui/core';
import React, { ReactElement } from 'react';
import styled from 'styled-components';

import { CountrySelectWrapper, CountrySelector } from '../CountrySelector';
import { CountrySelectorProps } from '../CountrySelector/CountrySelector';
import { ListItemType } from '../useGroupedSurveyList';
import { ListItem, ListItemSkeleton } from './ListItem';
import { BOTTOM_NAVIGATION_HEIGHT_DYNAMIC } from '../../constants';

const Wrapper = styled.div`
  background: ${({ theme }) => theme.palette.background.default};
  block-size: calc(100% - ${BOTTOM_NAVIGATION_HEIGHT_DYNAMIC});
  padding-block-end: calc(1.25rem + ${BOTTOM_NAVIGATION_HEIGHT_DYNAMIC});
  padding-block-start: 1.25rem;
  padding-inline: 1.25rem;

  ${CountrySelectWrapper} {
    margin-block-end: 1.5rem;

    .MuiOutlinedInput-notchedOutline {
      border: none;
    }

    .MuiInputBase-root .MuiSvgIcon-root {
      display: none;
    }
  }
`;

const BaseList = styled(MuiList).attrs({ disablePadding: true })``;

const CategoryTitle = styled(Typography).attrs({
  component: 'h2',
  variant: 'body1',
})`
  margin-block-end: 1rem;
`;

interface SelectListProps {
  countrySelector: ReactElement<CountrySelectorProps, typeof CountrySelector>;
  items?: ListItemType[];
  onSelect: (item: ListItemType) => void;
  showLoader?: boolean;
}

const List = ({
  parentItem,
  items,
  onSelect,
  countrySelector,
}: SelectListProps & { parentItem: ListItemType }) => {
  const parentTitle = parentItem?.value;
  return (
    <Wrapper>
      {countrySelector}
      {parentTitle && <CategoryTitle>{parentTitle}</CategoryTitle>}
      <BaseList>
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
    </Wrapper>
  );
};

const ListSkeleton = ({ length = 5 }: { length?: number }) => {
  const listItem = <ListItemSkeleton />;
  return <BaseList>{Array.from({ length }).map(_ => listItem)}</BaseList>;
};

export const MobileSelectList = ({
  countrySelector,
  items,
  onSelect,
  showLoader,
}: SelectListProps) => {
  return (
    <Wrapper>
      {countrySelector}
      {showLoader ? (
        <ListSkeleton />
      ) : (
        <BaseList>
          {items?.length === 0 ? (
            <Typography color="textSecondary">No items to display</Typography>
          ) : (
            items?.map(item => (
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
            ))
          )}
        </BaseList>
      )}
    </Wrapper>
  );
};
