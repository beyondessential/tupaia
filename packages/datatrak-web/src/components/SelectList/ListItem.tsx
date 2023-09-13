/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Collapse, ListItem as MuiListItem } from '@material-ui/core';
import { Check, Description, FolderOpenTwoTone, KeyboardArrowRight } from '@material-ui/icons';

const IconWrapper = styled.div`
  padding-right: 0.5rem;
  display: flex;
  align-items: center;
  width: 1.5rem;
`;

export const BaseListItem = styled(MuiListItem)`
  display: flex;
  align-items: center;
  border: 1px solid transparent;
  border-radius: 3px;
  padding: 0.3rem 1rem 0.3rem 0.5rem;
  &.Mui-selected {
    border-color: ${({ theme }) => theme.palette.primary.main};
    background-color: transparent;
  }
  .MuiCollapse-container & {
    padding-left: 1rem;
  }
  &:hover,
  &.Mui-selected:hover,
  &:focus,
  &.Mui-selected:focus {
    background-color: ${({ theme }) => theme.palette.primary.main}33;
  }
  .MuiSvgIcon-root {
    font-size: 1rem;
  }
`;

const Arrow = styled(KeyboardArrowRight)<{
  $open?: boolean;
}>`
  transform: ${({ $open }) => ($open ? 'rotate(90deg)' : 'rotate(0deg)')};
  transition: transform 0.1s ease-in-out;
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

export type ListItemType = Record<string, unknown> & {
  children?: ListItemType[];
  name: string;
  value: string;
  selected?: boolean;
};

interface ListItemProps {
  item: ListItemType;
  children?: React.ReactNode;
  onSelect: (item: ListItemType) => void;
}

export const ListItem = ({ item, children, onSelect }: ListItemProps) => {
  const [open, setOpen] = useState(false);
  const isNested = !!item.children;

  const getIcon = () => {
    if (isNested) return FolderOpenTwoTone;
    return Description;
  };

  const toggleOpen = () => {
    setOpen(!open);
  };

  const onClick = () => {
    if (isNested) {
      return toggleOpen();
    }
    return onSelect(item);
  };

  const Icon = getIcon();

  return (
    <>
      <BaseListItem button onClick={onClick} selected={item.selected}>
        <ButtonContainer>
          <IconWrapper>
            <Icon color="primary" />
          </IconWrapper>
          {item.name}
          {isNested && <Arrow $open={open} />}
        </ButtonContainer>
        {item.selected && <Check color="primary" />}
      </BaseListItem>
      {isNested && <Collapse in={open}>{children}</Collapse>}
    </>
  );
};
