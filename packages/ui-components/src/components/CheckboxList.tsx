/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { FC, ReactElement } from 'react';
import {
  Card,
  CardHeader,
  Grid,
  List as MuiList,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Divider,
} from '@material-ui/core';
import styled from 'styled-components';
import { FlexStart } from './Layout/Flexbox';

const StyledRootGrid = styled(Grid)`
  justify-content: center;
`;

const StyledCard = styled(Card)`
  width: 70vw;
  height: 50vh;
  max-width: 60rem;
  max-height: 30rem;
  overflow: auto;
`;

const StyledCardHeader = styled(CardHeader)`
  text-align: left;
`;

const StyledHeader = styled.span`
  font-size: 14px;
  font-weight: bold;
  color: ${props => props.theme.palette.text.primary};
  padding-right: 20px;
`;

const StyledSubHeader = styled.span`
  font-size: 10px;
  color: ${props => props.theme.palette.text.secondary};
  margin-top: 2px;
`;

interface ListItemProps {
  name: string;
  code: string;
}

function not(a: ListItemProps[], b: ListItemProps[]): ListItemProps[] {
  return a.filter(item => b.findIndex(i => i.code === item.code) === -1);
}

function intersection(a: ListItemProps[], b: ListItemProps[]): ListItemProps[] {
  return a.filter(item => b.findIndex(i => i.code === item.code) !== -1);
}

function union(a: ListItemProps[], b: ListItemProps[]): ListItemProps[] {
  return [...a, ...not(b, a)];
}

const Title: FC<{
  title: string;
  numberOfCheckedItems: number;
  totalItems: number;
}> = ({ title, numberOfCheckedItems, totalItems }): ReactElement => (
  <FlexStart>
    <StyledHeader>{title}</StyledHeader>
    <StyledSubHeader>{`${numberOfCheckedItems}/${totalItems} selected`}</StyledSubHeader>
  </FlexStart>
);

const List: FC<{
  items: ListItemProps[];
  title: string;
  selectedItems: ListItemProps[];
  handleCheckAll: (items: ListItemProps[]) => () => void;
  handleCheck: (item: ListItemProps) => () => void;
  numberOfChecked: number;
}> = ({
  items,
  handleCheckAll,
  title,
  numberOfChecked,
  handleCheck,
  selectedItems,
}): ReactElement => (
  <StyledCard>
    <StyledCardHeader
      avatar={
        <Checkbox
          onClick={handleCheckAll(items)}
          checked={numberOfChecked === items.length && items.length !== 0}
          indeterminate={numberOfChecked !== items.length && numberOfChecked !== 0}
          disabled={items.length === 0}
          inputProps={{ 'aria-label': 'all items selected' }}
        />
      }
      title={
        <Title title={title} totalItems={items.length} numberOfCheckedItems={numberOfChecked} />
      }
    />
    <Divider />
    <MuiList dense component="div" role="list">
      {items.map(item => {
        const { name, code } = item;
        const labelId = `transfer-list-all-item-${name}-label`;

        return (
          <ListItem key={code} role="listitem" button onClick={handleCheck(item)}>
            <ListItemIcon>
              <Checkbox
                checked={selectedItems.findIndex(selectedItem => selectedItem.code === code) !== -1}
                tabIndex={-1}
                disableRipple
                inputProps={{ 'aria-labelledby': labelId }}
              />
            </ListItemIcon>
            <ListItemText id={labelId} primary={name} />
          </ListItem>
        );
      })}
      <ListItem />
    </MuiList>
  </StyledCard>
);

export const CheckboxList: FC<{
  list: ListItemProps[];
  title?: string;
  selectedItems: any[];
  setSelectedItems: (items: ListItemProps[]) => void;
}> = ({ list, title = 'Choices', selectedItems, setSelectedItems }): ReactElement => {
  const numberOfChecked = (items: ListItemProps[]) => intersection(selectedItems, items).length;

  const handleCheckAll = (items: ListItemProps[]) => () => {
    if (numberOfChecked(items) === list.length) {
      setSelectedItems(not(selectedItems, items));
    } else {
      setSelectedItems(union(selectedItems, items));
    }
  };

  const handleCheck = (item: ListItemProps) => () => {
    const currentIndex = selectedItems.findIndex(selectedItem => selectedItem.code === item.code);
    const newChecked = [...selectedItems];

    if (currentIndex === -1) {
      newChecked.push(item);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setSelectedItems(newChecked);
  };
  return (
    <StyledRootGrid container spacing={2} alignItems="center">
      <Grid item>
        <List
          items={list}
          selectedItems={selectedItems}
          handleCheck={handleCheck}
          handleCheckAll={handleCheckAll}
          title={title}
          numberOfChecked={numberOfChecked(list)}
        />
      </Grid>
    </StyledRootGrid>
  );
};
