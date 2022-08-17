/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
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

function not(a, b) {
  return a.filter(value => b.indexOf(value) === -1);
}

function intersection(a, b) {
  return a.filter(value => b.indexOf(value) !== -1);
}

function union(a, b) {
  return [...a, ...not(b, a)];
}

export const CheckboxList = ({ list, leftTitle, selectedItems, setSelectedItems }) => {
  const numberOfChecked = items => intersection(selectedItems, items).length;

  const handleToggleAll = items => () => {
    if (numberOfChecked(items) === list.length) {
      setSelectedItems(not(selectedItems, items));
    } else {
      setSelectedItems(union(selectedItems, items));
    }
  };

  const handleToggle = value => () => {
    const currentIndex = selectedItems.indexOf(value);
    const newChecked = [...selectedItems];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setSelectedItems(newChecked);
  };

  const Title = ({ title, items }) => (
    <FlexStart>
      <StyledHeader>{title}</StyledHeader>
      <StyledSubHeader>{`${numberOfChecked(items)}/${items.length} selected`}</StyledSubHeader>
    </FlexStart>
  );

  const customList = (title, items) => (
    <StyledCard>
      <StyledCardHeader
        avatar={
          <Checkbox
            onClick={handleToggleAll(items)}
            checked={numberOfChecked(items) === items.length && items.length !== 0}
            indeterminate={numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0}
            disabled={items.length === 0}
            inputProps={{ 'aria-label': 'all items selected' }}
          />
        }
        title={<Title title={title} items={items} />}
      />
      <Divider />
      <List dense component="div" role="list">
        {items.map(value => {
          const labelId = `transfer-list-all-item-${value}-label`;

          return (
            <ListItem key={value} role="listitem" button onClick={handleToggle(value)}>
              <ListItemIcon>
                <Checkbox
                  checked={selectedItems.indexOf(value) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={value} />
            </ListItem>
          );
        })}
        <ListItem />
      </List>
    </StyledCard>
  );

  return (
    <StyledRootGrid container spacing={2} alignItems="center">
      <Grid item>{customList(leftTitle || 'Choices', list)}</Grid>
    </StyledRootGrid>
  );
};
