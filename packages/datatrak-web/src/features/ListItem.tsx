/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { ArrowLeftIcon } from '../components';
import { ListItem as MuiListItem, ListItemProps as MuiListItemProps } from '@material-ui/core';

const Content = styled.div`
  flex: 1;
`;

const Arrow = styled(ArrowLeftIcon)`
  font-size: 1rem;
  color: ${({ theme }) => theme.palette.primary.main};
  transform: rotate(180deg);
`;

// explicitly set the types so that the overrides are applied, for the `button` prop
export const BaseListItem = styled(MuiListItem)<MuiListItemProps>`
  border-radius: 10px;
  background: white;
  padding: 1rem;
  margin-bottom: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border: 1px solid transparent;
  text-align: left;

  &.Mui-disabled {
    opacity: 1; // still have the icon as the full opacity
    color: ${({ theme }) => theme.palette.text.disabled};
  }
`;

const IconWrapper = styled.div`
  padding-right: 0.5rem;
  display: flex;
  align-items: center;
  width: 2rem;
  font-size: 2rem;
  svg {
    color: ${({ theme }) => theme.palette.primary.main};
    height: auto;
  }
`;

type ListItemType = Record<string, string>;

interface ListItemProps {
  item: ListItemType;
  onClick: (item: any) => void;
  children?: ReactNode;
}

export const ListItem = ({ item, onClick, children }: ListItemProps) => {
  const { content, selected, icon, button = true, disabled } = item;
  const isNested = !!item.children;

  const handleOnClick = () => {
    console.log('item', item);
    onClick(item);
  };

  // @ts-ignore
  return (
    <>
      <BaseListItem
        button={button}
        onClick={button ? handleOnClick : null}
        selected={selected}
        disabled={disabled}
      >
        <IconWrapper>{icon}</IconWrapper>
        <Content>{content}</Content>
        {isNested && <Arrow />}
      </BaseListItem>
      {children}
    </>
  );
};
