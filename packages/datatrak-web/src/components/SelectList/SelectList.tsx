/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { FormLabel } from '@material-ui/core';
import { ListItemType } from './ListItem';
import { List } from './List';

const Wrapper = styled.div`
  padding: 0;
  height: 100%;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
`;

const ListWrapper = styled.div`
  overflow-y: auto;
  max-height: 100%;
  padding: 0 1rem;
  border-radius: 3px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
`;

const Label = styled(FormLabel).attrs({
  component: 'h2',
})`
  margin-bottom: 1rem;
  font-size: 0.875rem;
`;
interface SelectListProps {
  items?: ListItemType[];
  onSelect?: (item: ListItemType) => void;
  label?: string;
}

export const SelectList = ({ items = [], onSelect, label }: SelectListProps) => {
  return (
    <Wrapper>
      <Label>{label}</Label>
      <ListWrapper>
        <List items={items} onSelect={onSelect} />
      </ListWrapper>
    </Wrapper>
  );
};
