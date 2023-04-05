/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import {
  FormControl as BaseFormControl,
  FormControlLabel,
  Card,
  CardHeader,
  List,
  ListItem,
  Checkbox,
  Divider,
} from '@material-ui/core';
import styled from 'styled-components';
import { FlexStart } from './Layout/Flexbox';
import { Tooltip } from './Tooltip';

const StyledCard = styled(Card)`
  width: 100%;
  height: 50vh;
  max-height: 30rem;
  overflow: auto;
  background-color: transparent;
  border: 1px solid ${props => props.theme.palette.common.white};
  .MuiCheckbox-root {
    margin-left: 1em;
    margin-right: 1em;
  }
`;

const StyledCardHeader = styled(CardHeader)`
  text-align: left;
`;

const StyledSubHeader = styled.p`
  font-size: 0.6rem;
  color: ${props => props.theme.palette.text.secondary};
  margin: 0;
`;

const FormControl = styled(BaseFormControl)`
  width: 100%;
  flex-direction: row;
  align-items: center;
`;

function not(a, b) {
  return a.filter(item => b.findIndex(i => i.code === item.code) === -1);
}

function intersection(a, b) {
  return a.filter(item => b.findIndex(i => i.code === item.code) !== -1);
}

function union(a, b) {
  return [...a, ...not(b, a)];
}

export const CheckboxList = ({ list, title = 'Choices', selectedItems, setSelectedItems }) => {
  const numberOfChecked = items => intersection(selectedItems, items).length;
  const enabledItems = list.filter(item => !item.disabled);

  const handleCheckAll = items => () => {
    if (numberOfChecked(items) === enabledItems.length) {
      setSelectedItems(not(selectedItems, items));
    } else {
      setSelectedItems(union(selectedItems, items));
    }
  };

  const handleCheck = item => () => {
    const currentIndex = selectedItems.findIndex(selectedItem => selectedItem.code === item.code);
    const newChecked = [...selectedItems];

    if (currentIndex === -1) {
      newChecked.push(item);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setSelectedItems(newChecked);
  };

  const Title = ({ title, items }) => (
    <FlexStart>
      <FormControl>
        <FormControlLabel
          label={title}
          control={
            <Checkbox
              onClick={handleCheckAll(enabledItems)}
              checked={
                numberOfChecked(enabledItems) === enabledItems.length && enabledItems.length !== 0
              }
              indeterminate={
                numberOfChecked(enabledItems) !== enabledItems.length &&
                numberOfChecked(enabledItems) !== 0
              }
              disabled={enabledItems.length === 0}
              inputProps={{ 'aria-describedby': `subtitle-select-all-${title}` }}
            />
          }
        />
        <StyledSubHeader id={`subtitle-select-all-${title}`}>{`${numberOfChecked(items)}/${
          items.length
        } selected`}</StyledSubHeader>
      </FormControl>
    </FlexStart>
  );

  // If the list item has a tooltip, wrap it in a tooltip, otherwise just return the list item
  const CheckboxWrapper = ({ tooltip, children }) =>
    tooltip ? (
      <Tooltip describeChild title={tooltip} placement="bottom">
        {children}
      </Tooltip>
    ) : (
      <div>{children}</div>
    );

  return (
    <StyledCard>
      <StyledCardHeader title={<Title title={title} items={list} />} />
      <Divider />
      <List dense component="div" role="list">
        {list.map(item => {
          const { name, code, disabled, tooltip } = item;
          return (
            <ListItem key={code} role="listitem">
              <CheckboxWrapper tooltip={tooltip}>
                <FormControl disabled={disabled}>
                  <FormControlLabel
                    label={name}
                    control={
                      <Checkbox
                        checked={
                          selectedItems.findIndex(selectedItem => selectedItem.code === code) !== -1
                        }
                        onClick={handleCheck(item)}
                        tabIndex={-1}
                        disableRipple
                      />
                    }
                  />
                </FormControl>
              </CheckboxWrapper>
            </ListItem>
          );
        })}
        <ListItem />
      </List>
    </StyledCard>
  );
};
