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
  Checkbox,
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
  border: 1px solid #ebebeb;
  text-align: left;
  .MuiCheckbox-root {
    margin: 0 1em;
    padding: 0;
  }
`;

const FormControl = styled(BaseFormControl)`
  width: 100%;
  flex-direction: row;
  height: 100%;
`;

const StyledCardHeader = styled(CardHeader)`
  text-align: left;
  border-bottom: 0.5px solid #ebebeb;
  padding: 1.2em 1.7em;
  .MuiFormControl-root {
    align-items: center;
  }
`;

const StyledSubHeader = styled.p`
  font-size: 0.6rem;
  color: ${props => props.theme.palette.text.secondary};
  margin: 0;
`;

const ListItem = styled.li`
  padding: 0;
  .MuiFormControlLabel-root {
    width: 100%;
    padding: 1.2em 1em;
    margin: 0;
  }
  &:not(&:last-child) {
    .MuiFormControlLabel-label {
      width: 100%;
      position: relative;
      &:before {
        content: '';
        position: absolute;
        /* To reach the base of the list item  we need to make it -70% from the base */
        bottom: -1.2em;
        left: -0.5em;
        height: 1px;
        width: 100%;
        /*  It is not possible to make a line less than 1px, so reducing the opacity of the border so as to make it appear thinner */
        opacity: 0.4;
        background-color: #ebebeb;
      }
    }
  }
`;

const ListTitle = styled.span`
  font-weight: bold;
`;
export interface ListItemProps {
  name: string;
  code: string;
  disabled?: boolean;
  tooltip?: string;
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

interface CheckboxListProps {
  list: ListItemProps[];
  title?: string;
  selectedItems: any[];
  setSelectedItems: (items: ListItemProps[]) => void;
}

export const CheckboxList = ({
  list,
  title = 'Choices',
  selectedItems,
  setSelectedItems,
}: CheckboxListProps) => {
  const numberOfChecked = (items: ListItemProps[]) => intersection(selectedItems, items).length;

  const enabledItems = list.filter(item => !item.disabled);

  const handleCheckAll = (items: ListItemProps[]) => () => {
    if (numberOfChecked(items) === enabledItems.length) {
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
  // If the list item has a tooltip, wrap it in a tooltip, otherwise just return the list item
  // @ts-ignore
  const CheckboxWrapper = ({ tooltip, children }) =>
    tooltip ? (
      <Tooltip title={tooltip} placement="bottom">
        {children}
      </Tooltip>
    ) : (
      <>{children}</>
    );

  const Title = () => (
    <FlexStart>
      <FormControl>
        <FormControlLabel
          label={<ListTitle>{title}</ListTitle>}
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
              color="primary"
            />
          }
        />
        <StyledSubHeader id={`subtitle-select-all-${title}`}>{`${numberOfChecked(list)}/${
          list.length
        } selected`}</StyledSubHeader>
      </FormControl>
    </FlexStart>
  );
  return (
    <StyledCard>
      <StyledCardHeader title={<Title />} />
      <List>
        {list.map(item => {
          const { name, code, disabled, tooltip } = item;
          return (
            <ListItem key={code}>
              <FormControl disabled={disabled}>
                <FormControlLabel
                  label={
                    <CheckboxWrapper tooltip={tooltip}>
                      <span>{name}</span>
                    </CheckboxWrapper>
                  }
                  control={
                    <Checkbox
                      checked={
                        selectedItems.findIndex(selectedItem => selectedItem.code === code) !== -1
                      }
                      onClick={handleCheck(item)}
                      tabIndex={-1}
                      disableRipple
                      color="primary"
                    />
                  }
                />
              </FormControl>
            </ListItem>
          );
        })}
      </List>
    </StyledCard>
  );
};
